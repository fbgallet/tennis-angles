import React, { useState, useRef, useEffect } from "react";
import styles from "./ShotInfoPanel.module.scss";
import { normalizePointerEvent } from "../utils/device-detection";

interface ShotInfoPanelProps {
  lenDownLine: number;
  lenCross: number;
  lenBisector: number;
  lenP2: number;
  angleDeg: number;
  distanceToShot1: number;
  distanceToShot2: number;
  distanceToBisector: number;
  displayPlayer: "player1" | "player2";
  shotType:
    | "flat_attack"
    | "powerful_topspin"
    | "rally_topspin"
    | "defensive_slice";
  // Coordinate data for precise ball time calculation
  contactPoint: { x: number; y: number };
  shot1Endpoint: { x: number; y: number };
  shot2Endpoint: { x: number; y: number };
  bisectorEndpoint: { x: number; y: number };
  opponentPosition: { x: number; y: number };
  visible: boolean;
  onClose: () => void;
}

const ShotInfoPanel: React.FC<ShotInfoPanelProps> = ({
  lenDownLine,
  lenCross,
  lenBisector,
  lenP2,
  angleDeg,
  distanceToShot1,
  distanceToShot2,
  distanceToBisector,
  displayPlayer,
  shotType,
  contactPoint,
  shot1Endpoint,
  shot2Endpoint,
  bisectorEndpoint,
  opponentPosition,
  visible,
  onClose,
}) => {
  const [position, setPosition] = useState({ x: 20, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (
    e: React.PointerEvent | React.TouchEvent | React.MouseEvent
  ) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).classList.contains(styles.header)
    ) {
      // Prevent default for touch events to avoid scrolling
      if ("touches" in e) {
        e.preventDefault();
      }

      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        const normalized = normalizePointerEvent(e);
        setDragOffset({
          x: normalized.clientX - rect.left,
          y: normalized.clientY - rect.top,
        });
      }
      e.preventDefault();
    }
  };

  const handlePointerMove = (e: PointerEvent | TouchEvent | MouseEvent) => {
    if (isDragging && panelRef.current) {
      // Prevent default for touch events to avoid scrolling
      if ("touches" in e) {
        e.preventDefault();
      }

      const container = panelRef.current.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const panelRect = panelRef.current.getBoundingClientRect();

        const normalized = normalizePointerEvent(e as any);
        let newX = normalized.clientX - containerRect.left - dragOffset.x;
        let newY = normalized.clientY - containerRect.top - dragOffset.y;

        // Keep panel within container bounds
        newX = Math.max(
          0,
          Math.min(newX, containerRect.width - panelRect.width)
        );
        newY = Math.max(
          0,
          Math.min(newY, containerRect.height - panelRect.height)
        );

        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      // Add all event types for maximum compatibility
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("touchmove", handlePointerMove);
      document.addEventListener("touchend", handlePointerUp);
      document.addEventListener("mousemove", handlePointerMove);
      document.addEventListener("mouseup", handlePointerUp);

      return () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
        document.removeEventListener("touchmove", handlePointerMove);
        document.removeEventListener("touchend", handlePointerUp);
        document.removeEventListener("mousemove", handlePointerMove);
        document.removeEventListener("mouseup", handlePointerUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      className={styles.shotInfoPanel}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onMouseDown={handlePointerDown}
    >
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>
      <button
        className={styles.infoBtn}
        onClick={(e) => {
          e.stopPropagation();
          setShowInfoPopup(!showInfoPopup);
        }}
        title="Show calculation details"
      >
        ℹ️
      </button>
      <div className={styles.header}>
        {displayPlayer === "player1" ? "Player 1" : "Player 2"} Shot & Angle
        Info
      </div>
      <div className={styles.infoTable}>
        {(() => {
          // Helper function to calculate estimated time to reach a shot
          const calculatePlayerTime = (distance: number) => {
            const lateralSpeed = 4; // m/s
            return distance / lateralSpeed;
          };

          // Helper function to get ball speed based on shot type
          const getBallSpeed = (shotType: string) => {
            switch (shotType) {
              case "flat_attack":
                return 110 / 3.6; // 110 km/h to m/s
              case "powerful_topspin":
                return 95 / 3.6; // 95 km/h to m/s
              case "rally_topspin":
                return 80 / 3.6; // 80 km/h to m/s
              case "defensive_slice":
                return 60 / 3.6; // 60 km/h to m/s
              default:
                return 80 / 3.6; // default to rally topspin
            }
          };

          // Helper function to get trajectory curve factor based on shot type
          const getCurveFactor = (shotType: string) => {
            switch (shotType) {
              case "flat_attack":
                return 1.05; // Minimal curve, mostly flat
              case "powerful_topspin":
                return 1.15; // Moderate topspin curve
              case "rally_topspin":
                return 1.25; // Significant topspin curve
              case "defensive_slice":
                return 1.1; // Slight curve due to slice
              default:
                return 1.15; // default to moderate curve
            }
          };

          // Helper function to calculate ball trajectory time to opponent's horizontal line
          const calculateBallTimeToOpponentLine = (
            shotStart: { x: number; y: number },
            shotEnd: { x: number; y: number },
            opponentY: number
          ) => {
            const ballSpeed = getBallSpeed(shotType);
            const curveFactor = getCurveFactor(shotType);

            // Calculate the trajectory vector
            const trajectoryVector = {
              x: shotEnd.x - shotStart.x,
              y: shotEnd.y - shotStart.y,
            };

            // If trajectory is parallel to opponent's line (no Y movement), use full distance
            if (Math.abs(trajectoryVector.y) < 0.001) {
              const fullDistance = Math.hypot(
                trajectoryVector.x,
                trajectoryVector.y
              );
              return (fullDistance * curveFactor) / ballSpeed;
            }

            // Calculate the ratio to reach opponent's Y coordinate
            const yDistanceToOpponent = opponentY - shotStart.y;
            const ratio = yDistanceToOpponent / trajectoryVector.y;

            // Don't clamp the ratio - allow extension beyond shot endpoint for back court positions
            // The ball trajectory continues in the same direction beyond the endpoint

            // Calculate the intersection point (can be beyond the shot endpoint)
            const intersectionPoint = {
              x: shotStart.x + trajectoryVector.x * ratio,
              y: shotStart.y + trajectoryVector.y * ratio,
            };

            // Calculate distance from contact point to intersection point
            const intersectionDistance = Math.hypot(
              intersectionPoint.x - shotStart.x,
              intersectionPoint.y - shotStart.y
            );

            return (intersectionDistance * curveFactor) / ballSpeed;
          };

          // We need to get the actual shot positions and opponent position
          // This data should come from the parent component, but for now we'll need to pass it
          // For now, let's use a simplified approach with the shot distances
          // TODO: This needs to be updated to receive actual coordinates from parent

          // Prepare shot data with opponent distances and time comparisons
          const shots = [
            {
              label: "Down-the-line shot",
              value: lenDownLine,
              opponentDistance: distanceToShot1,
              opponentTime: calculatePlayerTime(distanceToShot1),
              ballTime: calculateBallTimeToOpponentLine(
                contactPoint,
                shot1Endpoint,
                opponentPosition.y
              ),
            },
            {
              label: "Cross-court shot",
              value: lenCross,
              opponentDistance: distanceToShot2,
              opponentTime: calculatePlayerTime(distanceToShot2),
              ballTime: calculateBallTimeToOpponentLine(
                contactPoint,
                shot2Endpoint,
                opponentPosition.y
              ),
            },
            {
              label: "Medium shot (bisector)",
              value: lenBisector,
              opponentDistance: distanceToBisector,
              opponentTime: calculatePlayerTime(distanceToBisector),
              ballTime: calculateBallTimeToOpponentLine(
                contactPoint,
                bisectorEndpoint,
                opponentPosition.y
              ),
            },
          ];

          // Find min, max for opponent distances (excluding bisector) with 10% margin
          const opponentDistances = [
            shots[0].opponentDistance,
            shots[1].opponentDistance,
          ];
          const minOpponentDistance = Math.min(...opponentDistances);
          const maxOpponentDistance = Math.max(...opponentDistances);
          const distanceDifference = maxOpponentDistance - minOpponentDistance;
          const marginThreshold = minOpponentDistance * 0.1; // 10% margin

          // Only apply red/green if difference is greater than 10% of the minimum distance
          const shouldApplyColors = distanceDifference > marginThreshold;

          // Render rows with color
          return shots.map((s, i) => (
            <div className={styles.row} key={s.label}>
              <div>
                <span className={styles.label}>{s.label}:</span>
                <span className={styles.value} style={{ color: "black" }}>
                  {s.value.toFixed(2)} m
                </span>
              </div>
              <div className={styles.subRow}>
                <span
                  className={styles.subLabel}
                  style={{
                    ...(i < 2 && shouldApplyColors // Only color if difference > 10% margin
                      ? s.opponentDistance === minOpponentDistance
                        ? { color: "green" }
                        : s.opponentDistance === maxOpponentDistance
                        ? { color: "red" }
                        : {}
                      : {}),
                    // Add red background and bold if player time > ball time
                    ...(s.opponentTime > s.ballTime
                      ? {
                          color: "red",
                          fontWeight: "bold",
                          backgroundColor: "rgba(255, 0, 0, 0.1)",
                        }
                      : {}),
                  }}
                >
                  Opponent distance: {s.opponentDistance.toFixed(2)} m (
                  {s.opponentTime.toFixed(1)}s){" "}
                  {s.opponentTime > s.ballTime ? ">" : "<"} Ball:{" "}
                  {s.ballTime.toFixed(1)}s
                </span>
              </div>
            </div>
          ));
        })()}
        <div className={styles.row}>
          <div>
            <span className={styles.label}>Shots length difference:</span>
            <span className={styles.value}>
              {Math.abs(
                Math.max(lenDownLine, lenCross, lenBisector) -
                  Math.min(lenDownLine, lenCross, lenBisector)
              ).toFixed(2)}{" "}
              m
            </span>
          </div>
        </div>
        <div className={styles.row}>
          <div>
            <span className={styles.label}>
              {displayPlayer === "player1"
                ? "Player 1 → Player 2"
                : "Player 2 → Player 1"}
              :
            </span>
            <span className={styles.value}>{lenP2.toFixed(2)} m</span>
          </div>
        </div>
        <div className={styles.row}>
          <div>
            <span className={styles.label}>Angle between shots:</span>
            <span className={styles.value}>{angleDeg.toFixed(2)}°</span>
          </div>
        </div>
      </div>

      {/* Info Popup */}
      {showInfoPopup && (
        <div className={styles.infoPopup}>
          <div className={styles.infoPopupHeader}>
            <h3>Calculation Details</h3>
            <button
              className={styles.infoPopupClose}
              onClick={() => setShowInfoPopup(false)}
            >
              ✕
            </button>
          </div>
          <div className={styles.infoPopupContent}>
            <div className={styles.infoSection}>
              <h4>🎾 Shot Analysis</h4>
              <p>
                <strong>Shot Distances:</strong> Calculated from player contact
                point to shot endpoints
              </p>
              <p>
                <strong>Opponent Distance:</strong> Lateral distance needed to
                intercept shot trajectory (not endpoint distance)
              </p>
              <p>
                <strong>Color Coding:</strong> Green = shortest distance, Red =
                longest distance (only if difference &gt;10%)
              </p>
            </div>

            <div className={styles.infoSection}>
              <h4>⏱️ Time Calculations</h4>
              <p>
                <strong>Player Movement:</strong> Assumes 4 m/s lateral speed
              </p>
              <p>
                <strong>Ball Trajectory:</strong> Uses shot-specific speeds and
                curve factors:
              </p>
              <ul>
                <li>Flat attack: 110 km/h, 1.05x curve</li>
                <li>Powerful topspin: 95 km/h, 1.15x curve</li>
                <li>Rally topspin: 80 km/h, 1.25x curve</li>
                <li>Defensive slice: 60 km/h, 1.10x curve</li>
              </ul>
            </div>

            <div className={styles.infoSection}>
              <h4>🚨 Critical Alerts</h4>
              <p>
                <strong>Red + Bold:</strong> Player cannot reach shot in time
                (movement time &gt; ball time)
              </p>
              <p>
                <strong>Comparison:</strong> "&gt;" means player is too slow,
                "&lt;" means player can reach it
              </p>
            </div>

            <div className={styles.infoSection}>
              <h4>📐 Physics Model</h4>
              <p>
                <strong>Curve Factors:</strong> Account for topspin/slice
                trajectory deviation from straight line
              </p>
              <p>
                <strong>Rally topspin:</strong> +25% distance due to significant
                curve
              </p>
              <p>
                <strong>Flat shots:</strong> +5% minimal curve adjustment
              </p>
              <p>
                <strong>Interception Logic:</strong> Calculates perpendicular
                distance to shot path, not endpoint distance
              </p>
            </div>

            <div className={styles.infoSection}>
              <h4>🎯 Strategic Insights</h4>
              <p>
                <strong>Angle Analysis:</strong> Shows tactical angle between
                shot options
              </p>
              <p>
                <strong>Distance Difference:</strong> Helps identify positioning
                advantages
              </p>
              <p>
                <strong>Player Switching:</strong> Hover/drag players to see
                their perspective
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShotInfoPanel;
