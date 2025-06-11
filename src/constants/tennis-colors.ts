export interface CourtColorTheme {
  // Player colors
  player1: {
    primary: string;
    secondary: string;
    accent: string;
  };
  player2: {
    primary: string;
    secondary: string;
    accent: string;
  };
  // Shot colors
  shots: {
    player1: {
      primary: string;
      secondary: string;
      gradient: string[];
    };
    player2: {
      primary: string;
      secondary: string;
      gradient: string[];
    };
  };
  // Bisector colors
  bisectors: {
    player1: {
      primary: string;
      secondary: string;
      glow: string;
    };
    player2: {
      primary: string;
      secondary: string;
      glow: string;
    };
  };
  // Optimal position colors
  optimal: {
    player1: {
      primary: string;
      secondary: string;
      glow: string;
    };
    player2: {
      primary: string;
      secondary: string;
      glow: string;
    };
  };
  // Racket colors
  rackets: {
    player1: string;
    player2: string;
  };
}

// Clay Court Theme - Warm earth tones with reddish-orange accents
export const CLAY_COURT_THEME: CourtColorTheme = {
  player1: {
    primary: "#1e3a8a", // Deep blue
    secondary: "#3b82f6", // Bright blue
    accent: "#60a5fa", // Light blue
  },
  player2: {
    primary: "#7c2d12", // Deep brown-red
    secondary: "#dc2626", // Bright red
    accent: "#f87171", // Light red
  },
  shots: {
    player1: {
      primary: "#2563eb", // Blue
      secondary: "#f59e0b", // Clay orange
      gradient: ["#2563eb", "#f59e0b", "#dc2626"],
    },
    player2: {
      primary: "#dc2626", // Red
      secondary: "#f59e0b", // Clay orange
      gradient: ["#dc2626", "#f59e0b", "#2563eb"],
    },
  },
  bisectors: {
    player1: {
      primary: "#f59e0b", // Amber
      secondary: "#fbbf24", // Light amber
      glow: "#fef3c7", // Very light amber
    },
    player2: {
      primary: "#10b981", // Emerald
      secondary: "#34d399", // Light emerald
      glow: "#d1fae5", // Very light emerald
    },
  },
  optimal: {
    player1: {
      primary: "#f59e0b", // Amber
      secondary: "#fbbf24", // Light amber
      glow: "#fef3c7", // Very light amber
    },
    player2: {
      primary: "#10b981", // Emerald
      secondary: "#34d399", // Light emerald
      glow: "#d1fae5", // Very light emerald
    },
  },
  rackets: {
    player1: "#1e40af", // Dark blue
    player2: "#991b1b", // Dark red
  },
};

// Grass Court Theme - Fresh green palette with natural tones
export const GRASS_COURT_THEME: CourtColorTheme = {
  player1: {
    primary: "#1e40af", // Navy blue
    secondary: "#3b82f6", // Royal blue
    accent: "#93c5fd", // Light blue
  },
  player2: {
    primary: "#7c2d12", // Deep brown
    secondary: "#dc2626", // Crimson
    accent: "#fca5a5", // Light red
  },
  shots: {
    player1: {
      primary: "#2563eb", // Blue
      secondary: "#22c55e", // Grass green
      gradient: ["#2563eb", "#22c55e", "#16a34a"],
    },
    player2: {
      primary: "#dc2626", // Red
      secondary: "#22c55e", // Grass green
      gradient: ["#dc2626", "#22c55e", "#15803d"],
    },
  },
  bisectors: {
    player1: {
      primary: "#eab308", // Yellow
      secondary: "#facc15", // Light yellow
      glow: "#fef9c3", // Very light yellow
    },
    player2: {
      primary: "#06b6d4", // Cyan
      secondary: "#22d3ee", // Light cyan
      glow: "#cffafe", // Very light cyan
    },
  },
  optimal: {
    player1: {
      primary: "#eab308", // Yellow
      secondary: "#facc15", // Light yellow
      glow: "#fef9c3", // Very light yellow
    },
    player2: {
      primary: "#06b6d4", // Cyan
      secondary: "#22d3ee", // Light cyan
      glow: "#cffafe", // Very light cyan
    },
  },
  rackets: {
    player1: "#1e40af", // Dark blue
    player2: "#991b1b", // Dark red
  },
};

// Hard Court Theme - Modern blue/gray palette with high contrast
export const HARD_COURT_THEME: CourtColorTheme = {
  player1: {
    primary: "#1e3a8a", // Deep blue
    secondary: "#2563eb", // Bright blue
    accent: "#60a5fa", // Light blue
  },
  player2: {
    primary: "#7c2d12", // Deep burgundy
    secondary: "#dc2626", // Bright red
    accent: "#f87171", // Light red
  },
  shots: {
    player1: {
      primary: "#2563eb", // Blue
      secondary: "#06b6d4", // Cyan
      gradient: ["#2563eb", "#06b6d4", "#0891b2"],
    },
    player2: {
      primary: "#dc2626", // Red
      secondary: "#f59e0b", // Orange
      gradient: ["#dc2626", "#f59e0b", "#d97706"],
    },
  },
  bisectors: {
    player1: {
      primary: "#8b5cf6", // Purple
      secondary: "#a78bfa", // Light purple
      glow: "#ede9fe", // Very light purple
    },
    player2: {
      primary: "#f59e0b", // Orange
      secondary: "#fbbf24", // Light orange
      glow: "#fef3c7", // Very light orange
    },
  },
  optimal: {
    player1: {
      primary: "#8b5cf6", // Purple
      secondary: "#a78bfa", // Light purple
      glow: "#ede9fe", // Very light purple
    },
    player2: {
      primary: "#f59e0b", // Orange
      secondary: "#fbbf24", // Light orange
      glow: "#fef3c7", // Very light orange
    },
  },
  rackets: {
    player1: "#1e40af", // Dark blue
    player2: "#991b1b", // Dark red
  },
};

// Court theme mapping
export const COURT_THEMES = {
  clay: CLAY_COURT_THEME,
  grass: GRASS_COURT_THEME,
  hard: HARD_COURT_THEME,
} as const;

// Helper function to get theme based on court type
export function getCourtTheme(courtType: string): CourtColorTheme {
  const normalizedType = courtType.toLowerCase();
  if (normalizedType.includes("clay")) return COURT_THEMES.clay;
  if (normalizedType.includes("grass")) return COURT_THEMES.grass;
  return COURT_THEMES.hard; // Default to hard court
}

// Animation timing constants
export const ANIMATION_TIMINGS = {
  PULSE_DURATION: 1500, // ms
  PULSE_SCALE_MIN: 0.8,
  PULSE_SCALE_MAX: 1.2,
  GLOW_INTENSITY_MIN: 0.3,
  GLOW_INTENSITY_MAX: 1.0,
} as const;
