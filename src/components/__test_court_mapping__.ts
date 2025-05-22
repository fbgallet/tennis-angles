// Test mapping logic for tennis court landscape mode
// These tests are not for a test runner, but for in-app debugging and logging

// Constants matching the main code
const COURT_LENGTH = 23.77;
const COURT_WIDTH = 10.97;
const leftSinglesX = 0.914;
const rightSinglesX = 8.229;
const singlesCenterX = (leftSinglesX + rightSinglesX) / 2;
const topY = 0;
const botY = COURT_LENGTH;

// Dummy anchor points for a 1000x500 canvas
const pxTopLeft = { x: 100, y: 100 };
const pxTopRight = { x: 900, y: 100 };
const pxBotLeft = { x: 100, y: 400 };
const pxBotRight = { x: 900, y: 400 };

function courtToPxLandscape(logical: { x: number; y: number }) {
  // Use the same mapping as in TennisCourt.tsx
  const t = (botY - logical.y) / (botY - topY); // flip Y (vertical axis)
  const s = (logical.x - leftSinglesX) / (rightSinglesX - leftSinglesX); // X: 0 (left) to 1 (right)
  const leftX = pxTopLeft.x + s * (pxBotLeft.x - pxTopLeft.x);
  const rightX = pxTopRight.x + s * (pxBotRight.x - pxTopRight.x);
  const xPx = leftX + t * (rightX - leftX);
  const yPx = pxTopLeft.y + s * (pxBotLeft.y - pxTopLeft.y);
  return { x: xPx, y: yPx };
}

function logMapping(label: string, logical: { x: number; y: number }) {
  const px = courtToPxLandscape(logical);
  console.log(`[TEST] ${label} logical:`, logical, 'pixel:', px);
}

// Test all corners and middles
logMapping('Top-Left', { x: leftSinglesX, y: 0 });
logMapping('Top-Right', { x: rightSinglesX, y: 0 });
logMapping('Bottom-Left', { x: leftSinglesX, y: COURT_LENGTH });
logMapping('Bottom-Right', { x: rightSinglesX, y: COURT_LENGTH });
logMapping('Middle-Left', { x: leftSinglesX, y: COURT_LENGTH / 2 });
logMapping('Middle-Right', { x: rightSinglesX, y: COURT_LENGTH / 2 });
logMapping('Center', { x: singlesCenterX, y: COURT_LENGTH / 2 });
