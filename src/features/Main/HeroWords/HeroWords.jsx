"use client";

import React, { useEffect, useRef } from "react";
import styles from "./HeroWords.module.scss";
import {
  Poppins,
  Montserrat,
  Raleway,
  Rubik,
  Nunito,
} from "next/font/google";

const poppins = Poppins({ weight: ["400", "600", "800"], subsets: ["latin"] });
const montserrat = Montserrat({ weight: ["500", "700"], subsets: ["latin"] });
const raleway = Raleway({ weight: ["500"], subsets: ["latin"] });
const rubik = Rubik({ weight: ["500", "700"], subsets: ["latin"] });
const nunito = Nunito({ weight: ["600"], subsets: ["latin"] });

const fonts = [
  poppins.className,
  montserrat.className,
  raleway.className,
  rubik.className,
  nunito.className,
];

const words = [
  "Be Brave. Be Bold.",
  "My Hero",
  "Little Hero",
  "Future Avenger",
  "Born to Shine",
  "Power Mode On",
  "Super Style",
  "Boss Vibes",
  "Cool Kid",
  "Legend Mode",
];

const colors = [
  "rgba(20,30,70,0.9)",
  "rgba(220,50,50,0.8)",
  "rgba(240,180,20,0.9)",
  "rgba(0,0,0,0.7)",
  "rgba(50,150,250,0.8)",
];

export default function HeroWords() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const isMobile = window.innerWidth < 768;

    const initialCount = isMobile ? 40 : 80;
    const spawnSpeed = isMobile ? 400 : 200;

    const spawnWord = (preload = false) => {
      const span = document.createElement("span");
      span.className = styles.word;

      const z = Math.random() * 1200 - 1000;
      const spread = 1 + Math.abs(z) / 600;
      let x = (Math.random() * 100 - 50) * spread + 50;
      x = Math.max(-50, Math.min(150, x));

      const duration = 20 - ((z + 1000) / 1200) * 10 + Math.random() * 5;
      const delay = preload ? -(Math.random() * (duration - 2)) : 0;

      const opacity = z < -500 ? 0.4 : z < -200 ? 0.6 : 1;
      const blur = z < -500 ? (isMobile ? 0.5 : 2) : z < -200 ? 0.5 : 0;

      span.innerText = words[Math.floor(Math.random() * words.length)];
      span.style.color = colors[Math.floor(Math.random() * colors.length)];
      span.style.fontSize = `${Math.random() * (isMobile ? 16 : 40) + (isMobile ? 12 : 22)}px`;
      span.style.fontWeight = z < -500 ? 400 : 800;
      span.style.filter = blur ? `blur(${blur}px)` : "none";

      span.style.setProperty("--x", `${x}vw`);
      span.style.setProperty("--z", `${z}px`);
      span.style.setProperty("--opacity", opacity);
      span.style.animationDuration = `${duration}s`;
      span.style.animationDelay = `${delay}s`;

      span.classList.add(fonts[Math.floor(Math.random() * fonts.length)]);
      container.appendChild(span);

      setTimeout(() => {
        span.remove();
      }, (duration + Math.abs(delay)) * 1000);
    };

    // Pre-fill screen
    for (let i = 0; i < initialCount; i++) {
      spawnWord(true);
    }

    const interval = setInterval(() => spawnWord(false), spawnSpeed);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className={styles.heroword_main_wrap}>
      <h1>YOUR WORDS, YOUR STYLE</h1>
      <div ref={containerRef} className={styles.container} />
    </main>
  );
}
