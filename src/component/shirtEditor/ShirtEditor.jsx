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
import { toPng } from "html-to-image";

import fontIcon from "../../assessts/font.svg";
import letterIcon from "../../assessts/letter1.svg";
import familyIcon from "../../assessts/family.svg";
import keyboardIcon from "../../assessts/keyboard.svg";
import lineIcon from "../../assessts/Line.svg";

const ShirtEditor = forwardRef(({ 
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
  setText
}, ref) => {
  const [fonts, setFonts] = useState([]);
  const [activeTab, setActiveTab] = useState("font");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const loadedFontsRef = useRef(new Set());

  const inputRef = useRef(null);
  const viewRef = useRef(null);
  const editorRef = useRef(null);

  /* ================= EXPOSE IMAGE CAPTURE ================= */
  useImperativeHandle(ref, () => ({
    captureImage: async () => {
      if (!editorRef.current) return null;
      try {
        await new Promise((r) => setTimeout(r, 150));
        const dataUrl = await toPng(editorRef.current, {
          cacheBust: true,
          pixelRatio: 2,
        });
        return dataUrl;
      } catch (err) {
        console.error("Capture failed:", err);
        return null;
      }
    },
  }));

  /* ================= FETCH FONTS ================= */
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const res = await api.get("/v2/font?activeOnly=true", {
          headers: {
            "x-api-key": "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
          },
        });
        setFonts(res?.data?.data || []);
      } catch (err) {
        console.error("Font fetch error:", err);
      }
    };
    fetchFonts();
  }, []);

  /* ================= LOAD DYNAMIC FONTS ================= */
  useEffect(() => {
    if (!fonts.length) return;
    let isCancelled = false;
    const loadFonts = async () => {
      try {
        const fontPromises = fonts.map((font) => {
          if (loadedFontsRef.current.has(font.family)) return Promise.resolve();
          const fontFace = new FontFace(font.family, `url(${font.downloadUrl})`);
          return fontFace.load().then((loaded) => {
            document.fonts.add(loaded);
            loadedFontsRef.current.add(font.family);
          });
        });
        await Promise.all(fontPromises);
        if (!isCancelled) setFontsLoaded(true);
      } catch (err) {
        if (!isCancelled) setFontsLoaded(true); 
      }
    };
    loadFonts();
    return () => { isCancelled = true; };
  }, [fonts]);

  /* ================= IOS & SCROLL FUNCTIONALITY ================= */
  
  const startTextEditing = () => {
    setIsEditing(true);
    
    // 1. Scroll 30% of viewport height on mobile
    if (window.innerWidth <= 768) {
      const scrollAmount = window.innerHeight * 0.3;
      window.scrollTo({
        top: scrollAmount,
        behavior: "smooth"
      });
    }

    // 2. iOS Keyboard Fix: Use requestAnimationFrame instead of setTimeout
    // This keeps the focus request tied closer to the user click event
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    });
  };

  const handleBlur = (e) => {
    // 3. Fix Closing Issue: 
    // If the new focus target is inside the editor (like a font button), don't close.
    if (e.relatedTarget && editorRef.current?.contains(e.relatedTarget)) {
      return; 
    }
    
    if (inputRef.current) {
      setScrollPos(inputRef.current.scrollTop);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur({ relatedTarget: null }); // Force close on Enter
    }
  };

  /* ================= SELECTION HANDLERS ================= */
  // Re-focus after selection to ensure the keyboard stays open on iOS
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
    fontFamily: `'${selectedFont}', Arial, sans-serif`,
    fontSize: `${selectedSize}px`,
  };

  return (
    <section className={styles.img_main_wrap} ref={editorRef} tabIndex="-1">
      <div className={styles.img_wrap}>
        {!imageLoaded && (
          <div className={styles.shimmerWrapper}>
            <div className={styles.shimmer} />
          </div>
        )}

        <Image
          src={product?.canvasImage}
          alt="product"
          width={500}
          height={600}
          className={styles.mainImage}
          priority
          unoptimized
          onLoadingComplete={() => setImageLoaded(true)}
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        />

        {product && (
          isEditing ? (
            <textarea
              ref={inputRef}
              className={`${styles.presetText} ${styles.editInput}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={dynamicStyles}
            />
          ) : (
            <div
              ref={viewRef}
              className={styles.presetText}
              onClick={startTextEditing}
              style={dynamicStyles}
            >
              {text.trim() || "Your Text Here"}
            </div>
          )
        )}

        {isEditing && (
          <div className={styles.floatingToolbar} tabIndex="-1">
            <button
              onClick={() => setActiveTab("size")}
              className={`${styles.toolButton} ${activeTab === "size" ? styles.activeTool : ""}`}
            >
              <Image src={letterIcon} alt="size" />
              <span>Font Size</span>
            </button>

            <button
              onClick={() => setActiveTab("color")}
              className={`${styles.toolButton} ${activeTab === "color" ? styles.activeTool : ""}`}
            >
              <Image src={fontIcon} alt="color" />
              <span>Colour</span>
            </button>

            <button
              onClick={() => setActiveTab("font")}
              className={`${styles.toolButton} ${activeTab === "font" ? styles.activeTool : ""}`}
            >
              <Image src={familyIcon} alt="font" />
              <span>Fonts</span>
            </button>

            <div className={styles.toolButton} onClick={startTextEditing}>
              <Image src={keyboardIcon} alt="edit" />
              <span>Edit</span>
            </div>

            <button
              className={styles.closeToolbarBtn}
              onClick={() => setIsEditing(false)}
            >
              ×
            </button>

            <div className={styles.optionsPanel}>
              {activeTab === "font" && (
                <div className={styles.fontOptions}>
                  {fonts.map((font) => (
                    <button
                      key={font.family}
                      onClick={() => onFontSelect(font)}
                      className={`${styles.fontOption} ${selectedFont === font.family ? styles.active : ""}`}
                      style={{ fontFamily: font.family }}
                    >
                      {font.family}
                      <Image src={lineIcon} alt="line" />
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "color" && (
                <div className={styles.colorOptions}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => onColorSelect(c)}
                      className={`${styles.colorSwatch} ${selectedColor === c ? styles.activeColor : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}

              {activeTab === "size" && (
                <div className={styles.sizeOptions}>
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => onSizeSelect(s)}
                      className={`${styles.sizeBtn} ${selectedSize === s ? styles.activeSize : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default ShirtEditor;