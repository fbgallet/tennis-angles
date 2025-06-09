import type { CourtType, CourtOrientation } from "../types/tennis";

export const COURT_BG_IMAGES: Record<
  CourtType,
  Record<CourtOrientation, string>
> = {
  clay: {
    portrait: "/court-bg-portrait-clay.png",
    landscape: "/court-bg-landscape-clay.png",
  },
  hard: {
    portrait: "/court-bg-portrait-hard.png",
    landscape: "/court-bg-landscape-hard.png",
  },
  grass: {
    portrait: "/court-bg-portrait-grass.png",
    landscape: "/court-bg-landscape-grass.png",
  },
};
