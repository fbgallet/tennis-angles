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
          }
        } else {
          // Just get current count without incrementing
          const response = await fetch("/api/visits");
          if (response.ok) {
            const data = await response.json();
            setVisitCount(data.visits);
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

  if (isLoading || visitCount === null) {
    return null; // Don't render until we have the count
  }

  return (
    <div className={styles.counter}>
      <span className={styles.text}>
        {visitCount.toLocaleString()} visit{visitCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
