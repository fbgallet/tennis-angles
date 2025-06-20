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
    primary: "#dc2626", // Bright red (more visible on clay)
    secondary: "#ef4444", // Brighter red
    accent: "#f87171", // Light red
  },
  shots: {
    player1: {
      primary: "#1e3a8a", // Same as player color
      secondary: "#1e3a8a", // Same as player color
      gradient: ["#1e3a8a"], // Uniform color
    },
    player2: {
      primary: "#dc2626", // Same as player color
      secondary: "#dc2626", // Same as player color
      gradient: ["#dc2626"], // Uniform color
    },
  },
  bisectors: {
    player1: {
      primary: "#60a5fa", // Light blue (harmonious with player blue)
      secondary: "#93c5fd", // Lighter blue
      glow: "#dbeafe", // Very light blue
    },
    player2: {
      primary: "#f87171", // Soft red/pink
      secondary: "#fca5a5", // Light pink
      glow: "#fee2e2", // Very light pink
    },
  },
  optimal: {
    player1: {
      primary: "#f59e0b", // Amber
      secondary: "#fbbf24", // Light amber
      glow: "#fef3c780", // Very light amber
    },
    player2: {
      primary: "#10b981", // Emerald
      secondary: "#34d399", // Light emerald
      glow: "#d1fae580", // Very light emerald
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
    primary: "#dc2626", // Bright red (more visible on grass)
    secondary: "#ef4444", // Brighter red
    accent: "#fca5a5", // Light red
  },
  shots: {
    player1: {
      primary: "#1e40af", // Same as player color
      secondary: "#1e40af", // Same as player color
      gradient: ["#1e40af"], // Uniform color
    },
    player2: {
      primary: "#dc2626", // Same as player color
      secondary: "#dc2626", // Same as player color
      gradient: ["#dc2626"], // Uniform color
    },
  },
  bisectors: {
    player1: {
      primary: "#60a5fa", // Light blue (harmonious with player blue)
      secondary: "#93c5fd", // Lighter blue
      glow: "#dbeafe", // Very light blue
    },
    player2: {
      primary: "#f97316", // Orange (harmonious with player red)
      secondary: "#fb923c", // Light orange
      glow: "#fed7aa", // Very light orange
    },
  },
  optimal: {
    player1: {
      primary: "#eab308", // Yellow
      secondary: "#facc15", // Light yellow
      glow: "#fef9c380", // Very light yellow
    },
    player2: {
      primary: "#06b6d4", // Cyan
      secondary: "#22d3ee", // Light cyan
      glow: "#cffafe80", // Very light cyan
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
    primary: "#dc2626", // Bright red (more visible)
    secondary: "#ef4444", // Brighter red
    accent: "#f87171", // Light red
  },
  shots: {
    player1: {
      primary: "#1e3a8a", // Same as player color
      secondary: "#1e3a8a", // Same as player color
      gradient: ["#1e3a8a"], // Uniform color
    },
    player2: {
      primary: "#dc2626", // Same as player color
      secondary: "#dc2626", // Same as player color
      gradient: ["#dc2626"], // Uniform color
    },
  },
  bisectors: {
    player1: {
      primary: "#60a5fa", // Light blue (harmonious with player blue)
      secondary: "#93c5fd", // Lighter blue
      glow: "#dbeafe", // Very light blue
    },
    player2: {
      primary: "#f97316", // Orange (harmonious with player red)
      secondary: "#fb923c", // Light orange
      glow: "#fed7aa", // Very light orange
    },
  },
  optimal: {
    player1: {
      primary: "#8b5cf6", // Purple
      secondary: "#a78bfa", // Light purple
      glow: "#ede9fe80", // Very light purple
    },
    player2: {
      primary: "#f59e0b", // Orange
      secondary: "#fbbf24", // Light orange
      glow: "#fef3c780", // Very light orange
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
