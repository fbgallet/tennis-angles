// Tennis court dimensions (in meters)
export const COURT_LENGTH = 23.77;
export const COURT_WIDTH = 10.97;
export const SINGLES_WIDTH = 8.23;
export const DOUBLES_WIDTH = 10.97;
export const NET_Y = COURT_LENGTH / 2; // Net Y position (middle of the court)

// Singles sideline anchors (ITF standard, meters from left edge)
export const LEFT_SINGLES_X = 1.37;
export const RIGHT_SINGLES_X = 9.6;
export const SINGLES_CENTER_X = (LEFT_SINGLES_X + RIGHT_SINGLES_X) / 2;

// Doubles sideline anchors (ITF standard, meters from left edge)
export const LEFT_DOUBLES_X = 0;
export const RIGHT_DOUBLES_X = 10.97;
export const DOUBLES_CENTER_X = (LEFT_DOUBLES_X + RIGHT_DOUBLES_X) / 2;

export const TOP_Y = 0;
export const BOT_Y = COURT_LENGTH;

// Arm/racket drawing constants
export const ARM_RACKET_LENGTH = 1.105; // meters (approximate: arm+racquet, 30% longer)
export const CONTACT_POINT_RATIO = 0.8; // Contact point is 80% of the arm+racquet length (closer to racket end)

// Hit detection radius in px
export const HANDLE_RADIUS = 18;
export const HANDLE_CLICK_RADIUS = 32; // Larger clickable zone for double-click/long-press

// Background sizes for different orientations
export const BG_SIZES = {
  portrait: { width: 13.0, length: 28.0 },
  landscape: { width: 28.0, length: 13.0 },
};

// Original background image dimensions
export const BG_ORIG_DIMENSIONS = {
  portrait: { width: 500, height: 1000 },
  landscape: { width: 1000, height: 500 },
};

// Anchor points for coordinate mapping
export const ANCHOR_POINTS = {
  portrait: {
    topLeft: { x: 134, y: 161 },
    topRight: { x: 367, y: 161 },
    botLeft: { x: 134, y: 843 },
    botRight: { x: 367, y: 843 },
  },
  landscape: {
    topLeft: { x: 160, y: 134 },
    topRight: { x: 841, y: 134 },
    botLeft: { x: 160, y: 366 },
    botRight: { x: 841, y: 366 },
  },
};
