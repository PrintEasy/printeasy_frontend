"use client";

import Link from "next/link";
import styles from "./HeroWords.module.scss";

const ROW_ONE = [
  { emoji: "💅", name: "Drama Queen Diya", quote: '"Main hi star hoon"' },
  { emoji: "😎", name: "Attitude King Samar", quote: '"Bada dhamaka"' },
  { emoji: "👑", name: "Boss Baby Ruhi", quote: '"Rules? I make them"' },
  { emoji: "🕶️", name: "Chota Don Kabir", quote: '"Sabka favourite"' },
  { emoji: "🎈", name: "Masti Jaan Riya", quote: '"Fun, full-time job"' },
  { emoji: "⚡", name: "Nautanki Vihaan", quote: '"Rules bend for me"' },
];

const ROW_TWO = [
  { emoji: "🦁", name: "Sherdil Aarav", quote: '"Dil sher jaisa"' },
  { emoji: "🚀", name: "Rocket Man Reyansh", quote: '"Sky\'s not the limit"' },
  { emoji: "🌸", name: "Pyaari Zara", quote: '"Sweet but savage"' },
  { emoji: "🕸️", name: "Little Spidey Vihaan", quote: '"Web slinger in training"' },
  { emoji: "🏆", name: "Champion Aadhya", quote: '"Born to win"' },
  { emoji: "🐉", name: "Dragon Heart Ishaan", quote: '"Fierce and fun"' },
];

const PATCH_COLORS = [
  styles.c1,
  styles.c2,
  styles.c3,
  styles.c4,
  styles.c5,
  styles.c6,
  styles.c7,
  styles.c8,
  styles.c9,
  styles.c10,
];

function PatchRow({ items, reverse }) {
  const looped = [...items, ...items];

  return (
    <div className={styles.trackWrap}>
      <div className={`${styles.track} ${reverse ? styles.row2 : styles.row1}`}>
        {looped.map((patch, index) => (
          <div
            key={`${patch.name}-${index}`}
            className={`${styles.patch} ${PATCH_COLORS[index % PATCH_COLORS.length]}`}
          >
            <div className={styles.emoji}>{patch.emoji}</div>
            <div className={styles.name}>{patch.name}</div>
            <div className={styles.quote}>{patch.quote}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroWords() {
  return (
    <section className={styles.feed} aria-label="Made in the last hour">
      <span className={`${styles.sparkle} ${styles.s1}`} aria-hidden>
        ✦
      </span>
      <span className={`${styles.sparkle} ${styles.s2}`} aria-hidden>
        ✧
      </span>
      <span className={`${styles.sparkle} ${styles.s3}`} aria-hidden>
        ✦
      </span>

      <div className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.liveDot} aria-hidden />
          <span>Made in the last hour</span>
        </div>
      </div>

      <h3 className={styles.title}>Every kid&apos;s got a title.</h3>
      <p className={styles.sub}>Real names, real personalities, on real tees →</p>

      <PatchRow items={ROW_ONE} />
      <PatchRow items={ROW_TWO} reverse />

      <Link href="/search" className={styles.cta}>
        ✏️ Create your kid&apos;s title →
      </Link>
    </section>
  );
}
