"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./shirtEditor.module.scss";
import Image from "next/image";
import { COLORS, SIZES } from "@/constants";
import api from "@/axiosInstance/axiosInstance";
import html2canvas from "html2canvas";

import fontIcon from "../../assessts/font.svg";
import letterIcon from "../../assessts/letter1.svg";
import familyIcon from "../../assessts/family.svg";
import keyboardIcon from "../../assessts/keyboard.svg";
import lineIcon from "../../assessts/Line.svg";

const ShirtEditor = forwardRef(
  (
    {
      product,
      isEditing,
      setIsEditing,
      selectedSize,
      selectedFont,
      selectedColor,
      setSelectedColor,
      setSelectedFont,
      setSelectedSize,
      text,
      setText,
      onReady,
    },
    ref,
  ) => {
    const [fonts, setFonts] = useState([]);
    const [activeTab, setActiveTab] = useState("font");
    const [imageLoaded, setImageLoaded] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [imageDataUrl, setImageDataUrl] = useState(null);
    const loadedFontsRef = useRef(new Set());

    const inputRef = useRef(null);
    const viewRef = useRef(null);
    const editorRef = useRef(null);

    /* ================= NOTIFY PARENT WHEN EDITOR IS READY ================= */
    useEffect(() => {
      if (imageLoaded && fontsLoaded) onReady?.();
    }, [imageLoaded, fontsLoaded, onReady]);

    /* ================= BLINKING CURSOR LOGIC ================= */
    useEffect(() => {
      if (isEditing) return;
      const interval = setInterval(() => setShowCursor((prev) => !prev), 530);
      return () => clearInterval(interval);
    }, [isEditing]);

    /* ================= IMAGE LOAD & CONVERT TO BASE64 ================= */
    useEffect(() => {
      if (!product?.canvasImage) return;

      const loadAndConvertImage = async () => {
        try {
          const img = new window.Image();
          img.crossOrigin = "anonymous";

          const loadPromise = new Promise((resolve, reject) => {
            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL("image/png");
                setImageDataUrl(dataUrl);
                setImageLoaded(true);
                setImageError(false);
                resolve();
              } catch (err) {
                reject(err);
              }
            };
            img.onerror = reject;
            img.src = `${product.canvasImage}?_t=${Date.now()}`;
          });

          await loadPromise;
        } catch {
          setImageDataUrl(product.canvasImage);
          setImageLoaded(true);
          setImageError(false);
        }
      };

      loadAndConvertImage();
    }, [product?.canvasImage]);

    const injectFontCSS = (fontFamily, fontUrl) => {
      if (document.querySelector(`style[data-font="${fontFamily}"]`)) return;
      const style = document.createElement("style");
      style.setAttribute("data-font", fontFamily);
      style.innerHTML = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('truetype');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    };

    /* ================= HTML2CANVAS CAPTURE FOR BACKEND ================= */
    useImperativeHandle(ref, () => ({
      captureImage: async () => {
        if (!editorRef.current) return null;

        try {
          const selectedFontObj = fonts.find((f) => f.family === selectedFont);
          if (selectedFontObj) injectFontCSS(selectedFontObj.family, selectedFontObj.downloadUrl);

          await document.fonts.ready;
          await new Promise((r) => setTimeout(r, 500));

          const canvas = await html2canvas(editorRef.current, {
            allowTaint: false,
            useCORS: true,
            scale: window.devicePixelRatio || 2,
            backgroundColor: null,
            logging: false,
            imageTimeout: 10000,
            removeContainer: true,
            foreignObjectRendering: false,
            windowWidth: editorRef.current.scrollWidth,
            windowHeight: editorRef.current.scrollHeight,
            onclone: (clonedDoc) => {
              const images = clonedDoc.querySelectorAll("img");
              images.forEach((img) => {
                img.style.opacity = "1";
                img.style.display = "block";
              });
              const textElements = clonedDoc.querySelectorAll(`.${styles.presetText}`);
              textElements.forEach((el) => {
                el.style.fontFamily = selectedFont;
                el.style.color = selectedColor;
                el.style.fontSize = `${selectedSize}px`;
              });
            },
          });

          return await new Promise((resolve) => {
            canvas.toBlob((blob) => {
              if (!blob) return resolve(null);
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            }, "image/png", 0.95);
          });
        } catch {
          try {
            const fallbackCanvas = await html2canvas(editorRef.current, {
              allowTaint: false,
              useCORS: false,
              scale: 1,
              backgroundColor: null,
              foreignObjectRendering: false,
            });
            return fallbackCanvas.toDataURL("image/png", 0.8);
          } catch {
            return null;
          }
        }
      },
    }));

    /* ================= FETCH FONTS ================= */
    useEffect(() => {
      const fetchFonts = async () => {
        try {
          const res = await api.get("/v2/font?activeOnly=true", {
            headers: {
              "x-api-key":
                "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
            },
          });
          setFonts(res?.data?.data || []);
        } catch (err) {
          console.error("Font fetch error:", err);
        }
      };
      fetchFonts();
    }, []);

    useEffect(() => {
      if (!fonts.length) return;

      const loadFonts = async () => {
        const promises = fonts.map(async (font) => {
          if (loadedFontsRef.current.has(font.family)) return;
          try {
            const f = new FontFace(font.family, `url(${font.downloadUrl})`);
            document.fonts.add(await f.load());
            injectFontCSS(font.family, font.downloadUrl);
            loadedFontsRef.current.add(font.family);
          } catch {}
        });
        await Promise.all(promises);
        await document.fonts.ready;
        setFontsLoaded(true);
      };

      loadFonts();
    }, [fonts]);

    const startTextEditing = () => {
      if (inputRef.current) {
        const len = inputRef.current.value.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(len, len);
      }
      setIsEditing(true);

      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setTimeout(() => {
          window.scrollTo({ top: window.innerHeight * 0.3, behavior: "smooth" });
        }, 100);
      }
    };

    const handleBlur = (e) => {
      if (e.relatedTarget && editorRef.current?.contains(e.relatedTarget)) return;
      setIsEditing(false);
    };

    const onFontSelect = (font) => {
      setSelectedFont(font.family);
      inputRef.current?.focus();
    };
    const onColorSelect = (c) => {
      setSelectedColor(c);
      inputRef.current?.focus();
    };
    const onSizeSelect = (s) => {
      setSelectedSize(s);
      inputRef.current?.focus();
    };

    const dynamicStyles = {
      color: selectedColor,
      fontFamily: `${selectedFont}, Arial, sans-serif`,
      fontSize: `${selectedSize}px`,
    };

    return (
      <section className={styles.img_main_wrap} ref={editorRef} tabIndex="-1" style={{ outline: "none" }}>
        <div className={styles.img_wrap}>
          {!imageLoaded && !imageError && (
            <div className={styles.shimmerWrapper}>
              <div className={styles.shimmer} />
            </div>
          )}

          {imageError && (
            <div style={{ padding: "20px", textAlign: "center", color: "#666", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "#f5f5f5", borderRadius: "8px" }}>
              <p style={{ fontSize: "48px", marginBottom: "10px" }}>⚠️</p>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Image Failed to Load</p>
              <p style={{ fontSize: "12px", color: "#999", marginBottom: "15px" }}>{product?.canvasImage?.substring(0, 60)}...</p>
              <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>Reload Page</button>
            </div>
          )}

          {imageDataUrl && (
            <img src={imageDataUrl} alt="product canvas" className={styles.mainImage} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} style={{ opacity: imageLoaded ? 1 : 0, transition: "opacity 0.3s ease", width: "100%", maxWidth: "500px", display: "block", margin: "0 auto" }} />
          )}

          {product && imageLoaded && (
            <>
              {isEditing ? (
                <textarea
                  ref={inputRef}
                  className={`${styles.presetText} ${styles.editInput}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={dynamicStyles}
                  onBlur={handleBlur}
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                />
              ) : (
                <div ref={viewRef} className={styles.presetText} onClick={startTextEditing} style={{ ...dynamicStyles, cursor: "text" }}>
                  {text.trim() || "Your Text Here"}
                  <span style={{ opacity: showCursor ? 1 : 0, transition: "opacity 0.1s", marginLeft: "2px", fontWeight: "100", color: selectedColor }}>|</span>
                </div>
              )}
            </>
          )}

          {isEditing && (
            <div className={styles.floatingToolbar} tabIndex="-1" style={{ outline: "none" }}>
              <button onClick={() => setActiveTab("size")} className={`${styles.toolButton} ${activeTab === "size" ? styles.activeTool : ""}`}><Image src={letterIcon} alt="size" /><span>Font Size</span></button>
              <button onClick={() => setActiveTab("color")} className={`${styles.toolButton} ${activeTab === "color" ? styles.activeTool : ""}`}><Image src={fontIcon} alt="color" /><span>Colour</span></button>
              <button onClick={() => setActiveTab("font")} className={`${styles.toolButton} ${activeTab === "font" ? styles.activeTool : ""}`}><Image src={familyIcon} alt="font" /><span>Fonts</span></button>
              <div className={styles.toolButton} onClick={startTextEditing}><Image src={keyboardIcon} alt="edit" /><span>Edit</span></div>
              <button className={styles.closeToolbarBtn} onClick={() => setIsEditing(false)}>×</button>

              <div className={styles.optionsPanel}>
                {activeTab === "font" && <div className={styles.fontOptions}>{fonts.map((font) => (
                  <button key={font.family} onClick={() => onFontSelect(font)} className={`${styles.fontOption} ${selectedFont === font.family ? styles.active : ""}`} style={{ fontFamily: font.family }}>{font.family}<Image src={lineIcon} alt="line" /></button>
                ))}</div>}

                {activeTab === "color" && <div className={styles.colorOptions}>{COLORS.map((c) => (
                  <button key={c} onClick={() => onColorSelect(c)} className={`${styles.colorSwatch} ${selectedColor === c ? styles.activeColor : ""}`} style={{ backgroundColor: c }} />
                ))}</div>}

                {activeTab === "size" && <div className={styles.sizeOptions}>{SIZES.map((s) => (
                  <button key={s} onClick={() => onSizeSelect(s)} className={`${styles.sizeBtn} ${selectedSize === s ? styles.activeSize : ""}`}>{s}</button>
                ))}</div>}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  },
);

ShirtEditor.displayName = "ShirtEditor";

export default ShirtEditor;
