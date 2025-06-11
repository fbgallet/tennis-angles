"use client";

import Link from "next/link";
import TennisCourt from "../../components/TennisCourt";
import styles from "../../visualizer/page.module.css";
import { Metadata } from "next";

// Note: Since this is a client component, metadata needs to be handled differently
// We'll add it via Head component or move metadata to layout

export default function Visualizer() {
  return (
    <>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/en" className={styles.backButton}>
            ← Back to Theory
          </Link>
          {/* <h1 className={styles.title}>Tennis Angle Theory Visualizer</h1> */}
        </header>

        <main className={styles.main}>
          <TennisCourt />
        </main>
      </div>
    </>
  );
}
