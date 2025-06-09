// Test drag mapping for landscape mode

const test_COURT_LENGTH = 23.77;
const test_leftSinglesX = 0.914;
const test_rightSinglesX = 8.229;

function pxToCourtLandscape(px: number, py: number, pxTopLeft: {x:number,y:number}, pxTopRight: {x:number,y:number}, pxBotLeft: {x:number,y:number}) {
  // px, py: canvas pixel coordinates
  // pxTopLeft, pxTopRight, pxBotLeft: anchor points in px
  const t = (px - pxTopLeft.x) / (pxTopRight.x - pxTopLeft.x);
  const s = (py - pxTopLeft.y) / (pxBotLeft.y - pxTopLeft.y);
  const logicalY = t * test_COURT_LENGTH;
  const logicalX = test_leftSinglesX + s * (test_rightSinglesX - test_leftSinglesX);
  return { x: logicalX, y: logicalY };
}

// Simulate dragging from left-top to right-bottom of canvas
const test_pxTopLeft = { x: 100, y: 100 };
const test_pxTopRight = { x: 900, y: 100 };
const test_pxBotLeft = { x: 100, y: 400 };

console.log('Drag test:');
console.log('Top-left:', pxToCourtLandscape(100, 100, test_pxTopLeft, test_pxTopRight, test_pxBotLeft)); // should be { x: test_leftSinglesX, y: 0 }
console.log('Top-right:', pxToCourtLandscape(900, 100, test_pxTopLeft, test_pxTopRight, test_pxBotLeft)); // should be { x: test_leftSinglesX, y: test_COURT_LENGTH }
console.log('Bottom-left:', pxToCourtLandscape(100, 400, test_pxTopLeft, test_pxTopRight, test_pxBotLeft)); // should be { x: test_rightSinglesX, y: 0 }
console.log('Bottom-right:', pxToCourtLandscape(900, 400, test_pxTopLeft, test_pxTopRight, test_pxBotLeft)); // should be { x: test_rightSinglesX, y: test_COURT_LENGTH }
