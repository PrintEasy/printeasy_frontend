import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./shirtEditor.module.scss";
import Image from "next/image";
import api from "@/axiosInstance/axiosInstance";
import { toPng } from "html-to-image";

const ShirtEditor = forwardRef(({ product }, ref) => {
  const [text, setText] = useState(product?.presetText || "");
  const [isEditing, setIsEditing] = useState(false);
  const [fonts, setFonts] = useState([]);
  const [scrollPos, setScrollPos] = useState(0);

  const inputRef = useRef(null);
  const viewRef = useRef(null);
  const editorRef = useRef(null);

 useImperativeHandle(ref, () => ({
  captureImage: async () => {
    if (!editorRef.current) return null;

    try {
      // 1. Wait a tiny bit for the font/image to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 2. Perform the capture
      const dataUrl = await toPng(editorRef.current, {
        cacheBust: true,      
        pixelRatio: 2,       
        skipFonts: false,     
      });

      return dataUrl;
    } catch (err) {
      console.error("Capture process failed:", err);
      return null;
    }
  },
}));

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
    if (fonts.length > 0) {
      const styleId = "dynamic-fonts";
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      const fontFaceRules = fonts
        .map(
          (font) =>
            `@font-face { font-family: '${font.family}'; src: url('${font.downloadUrl}') format('truetype'); font-display: swap; }`
        )
        .join("\n");
      styleElement.innerHTML = fontFaceRules;
    }
  }, [fonts]);

  const handleBlur = () => {
    if (inputRef.current) {
      setScrollPos(inputRef.current.scrollTop);
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (!isEditing && viewRef.current) {
      viewRef.current.scrollTop = scrollPos;
    }
  }, [isEditing, scrollPos]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.scrollTop = inputRef.current.scrollHeight;
    }
  }, [text, isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  const dynamicStyles = {
    color: product?.fontColor || "white",
    fontFamily: `'${product?.fontFamily || "Summer Sunshine"}', sans-serif`,
    fontSize: `${product?.fontSize || 28}px`,
  };

  return (
    <section className={styles.img_main_wrap} ref={editorRef}>
      <div className={styles.img_wrap}>
        <img
          src={product?.canvasImage || "/placeholder.png"}
          alt="product"
          width={500}
          height={600}
          className={styles.mainImage}
          priority
          unoptimized
          crossOrigin="anonymous"
          loader={({ src }) => src}
        />

        {isEditing ? (
          <textarea
            ref={inputRef}
            className={`${styles.presetText} ${styles.editInput}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Your Text Here"
            style={dynamicStyles}
          />
        ) : (
          <div
            ref={viewRef}
            className={styles.presetText}
            onClick={() => setIsEditing(true)}
            style={dynamicStyles}
          >
            {text.trim() === "" ? "Your Text Here" : text}
          </div>
        )}
      </div>
    </section>
  );
});

export default ShirtEditor;
