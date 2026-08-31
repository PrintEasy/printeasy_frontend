"use client";

import React from "react";

export default function MaterialSymbol({
  name,
  filled = false,
  className = "",
  size = 24,
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
