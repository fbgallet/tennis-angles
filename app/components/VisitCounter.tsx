"use client";

import { useEffect, useState } from "react";
import styles from "./VisitCounter.module.css";

export default function VisitCounter() {
  const [visitCount, setVisitCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const incrementVisit = async () => {
      try {
        // Check if this is a new session to avoid counting multiple visits from same user
        const sessionKey = "tennis-angle-session";
        const hasVisitedThisSession = sessionStorage.getItem(sessionKey);

        if (!hasVisitedThisSession) {
          // Increment visit count via API
          const response = await fetch("/api/visits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            setVisitCount(data.visits);
            // Mark this session as visited
            sessionStorage.setItem(sessionKey, "true");
          } else {
            console.warn(
              "Failed to increment visit count, status:",
              response.status
            );
            // Fallback: still mark session and show 0
            sessionStorage.setItem(sessionKey, "true");
            setVisitCount(0);
          }
        } else {
          // Just get current count without incrementing
          const response = await fetch("/api/visits");
          if (response.ok) {
            const data = await response.json();
            setVisitCount(data.visits);
          } else {
            console.warn("Failed to get visit count, status:", response.status);
            setVisitCount(0);
          }
        }
      } catch (error) {
        console.error("Failed to update visit count:", error);
        // Fallback to a default display
        setVisitCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    incrementVisit();
  }, []);

  return (
    <div className={styles.counter}>
      <span className={styles.text}>
        {isLoading || visitCount === null
          ? "Loading visits..."
          : `${visitCount.toLocaleString()} visit${
              visitCount !== 1 ? "s" : ""
            }`}
      </span>
    </div>
  );
}
