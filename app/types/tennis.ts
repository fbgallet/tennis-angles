export type CourtOrientation = "portrait" | "landscape";
export type CourtType = "clay" | "hard" | "grass";
export type GameMode = "singles" | "doubles";
export type Handedness = "right" | "left";
export type SwingType = "auto" | "forehand" | "backhand";
export type ResolvedSwingType = "forehand" | "backhand";
export type ShotType =
  | "flat_attack"
  | "powerful_topspin"
  | "rally_topspin"
  | "defensive_slice";

export type DragTarget =
  | "player1"
  | "player2"
  | "player1bis"
  | "player2bis"
  | "shot1"
  | "shot2"
  | "shot3"
  | "shot4"
  | null;

export interface Position {
  x: number;
  y: number;
}

export interface PixelPosition {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Position;
  handedness: Handedness;
  swing: SwingType;
  hasMoved: boolean;
}

export interface ShotState {
  shot1: Position;
  shot2: Position;
  shot3: Position;
  shot4: Position;
}

export interface CourtSettings {
  orientation: CourtOrientation;
  type: CourtType;
  gameMode: GameMode;
  showStatsPanel: boolean;
  showAngles: boolean;
  showAnglesPlayer2: boolean;
  showShotsPlayer1: boolean;
  showShotsPlayer2: boolean;
  showBisectorPlayer1: boolean;
  showBisectorPlayer2: boolean;
  showOptimal: boolean;
}

export interface CanvasState {
  size: { width: number; height: number };
  bgImg: HTMLImageElement | null;
  bgLoaded: number;
}

export interface CoordinateTransforms {
  courtToPx: (logical: Position) => PixelPosition;
  pxToCourt: (pixel: { px: number; py: number }) => Position;
  hitTestHandles: (
    px: number,
    py: number,
    radiusOverride?: number
  ) => DragTarget;
}

export interface BisectorResult {
  bisectorEndPx: PixelPosition;
  optimalP1Px?: PixelPosition;
  optimalP2Px?: PixelPosition;
  optimalP1?: Position;
  optimalP2?: Position;
}

export interface AnchorPoints {
  pxTopLeft: PixelPosition;
  pxTopRight: PixelPosition;
  pxBotLeft: PixelPosition;
  pxBotRight: PixelPosition;
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
  courtToPx: (logical: Position) => PixelPosition;
  pxToCourt: (pixel: { px: number; py: number }) => Position;
}

export interface GameState {
  feedback: string;
}
