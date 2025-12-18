import React, { useState, useEffect, useRef } from "react";
import styles from "./shirtEditor.module.scss";
import Image from "next/image";

const ShirtEditor = ({ product }) => {
  // Initialize state with product data
  const [text, setText] = useState(product?.presetText || "Your Text Here");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  // Sync with product prop if it updates externally
  useEffect(() => {
    if (product?.presetText) {
      setText(product.presetText);
    }
  }, [product]);

  // Focus the textarea and move cursor to the end when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleTextClick = () => setIsEditing(true);
  const handleInputChange = (e) => setText(e.target.value);
  const handleBlur = () => setIsEditing(false);

  const handleKeyDown = (e) => {
    // Save on Enter (unless Shift is held for a new line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  // Dynamic values provided by your product object
  const dynamicStyles = {
    color: product?.fontColor || "white",
    fontFamily: product?.fontFamily || "Summer Sunshine, sans-serif",
    fontSize: `${product?.fontSize || 28}px`,
    fontWeight: "bold",
  };

  return (
    <section className={styles.img_main_wrap}>
      <div className={styles.img_wrap}>
        {/* Product Image */}
        <Image
          src={product?.canvasImage || "/placeholder.png"}
          alt="shirt product"
          width={500}
          height={600}
          className={styles.mainImage}
          priority
        />

        {/* Text Layer */}
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`${styles.presetText} ${styles.editInput}`}
            style={dynamicStyles}
          />
        ) : (
          <div
            className={styles.presetText}
            onClick={handleTextClick}
            style={dynamicStyles}
            title="Click to edit text"
          >
            {text}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShirtEditor;