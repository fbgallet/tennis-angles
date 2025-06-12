/**
 * Utility functions for device detection and touch handling
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  pixelRatio: number;
  screenSize: "small" | "medium" | "large";
}

/**
 * Detect if the device is mobile, including modern high-resolution devices
 */
export function detectDevice(): DeviceInfo {
  // Check for touch capability
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Get screen dimensions
  const screenWidth = Math.max(screen.width, screen.height);
  const screenHeight = Math.min(screen.width, screen.height);
  const pixelRatio = window.devicePixelRatio || 1;

  // Modern mobile detection that accounts for high-resolution screens
  const isMobileBySize =
    screenWidth <= 768 * pixelRatio || screenHeight <= 480 * pixelRatio;
  const isTabletBySize =
    screenWidth <= 1024 * pixelRatio && screenWidth > 768 * pixelRatio;

  // User agent fallback for edge cases
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileByUA =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );
  const isTabletByUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);

  // Combine detection methods
  const isMobile = (isMobileBySize || isMobileByUA) && isTouch;
  const isTablet = (isTabletBySize || isTabletByUA) && isTouch && !isMobile;

  // Determine screen size category
  let screenSize: "small" | "medium" | "large" = "large";
  if (isMobile) {
    screenSize = "small";
  } else if (isTablet) {
    screenSize = "medium";
  }

  return {
    isMobile,
    isTablet,
    isTouch,
    pixelRatio,
    screenSize,
  };
}

/**
 * Get touch-optimized handle radius based on device type
 */
export function getTouchOptimizedRadius(
  deviceInfo: DeviceInfo,
  baseRadius: number = 18
): number {
  if (deviceInfo.isMobile) {
    // Larger touch targets for mobile (minimum 44px as per Apple/Google guidelines)
    return Math.max(baseRadius * 1.8, 22);
  } else if (deviceInfo.isTablet) {
    // Slightly larger for tablets
    return Math.max(baseRadius * 1.4, 20);
  }
  return baseRadius;
}

/**
 * Get touch-optimized click radius for better touch interaction
 */
export function getTouchOptimizedClickRadius(
  deviceInfo: DeviceInfo,
  baseRadius: number = 32
): number {
  if (deviceInfo.isMobile) {
    // Even larger clickable area for mobile
    return Math.max(baseRadius * 1.5, 44);
  } else if (deviceInfo.isTablet) {
    return Math.max(baseRadius * 1.2, 38);
  }
  return baseRadius;
}

/**
 * Normalize pointer event to work consistently across mouse and touch
 */
export function normalizePointerEvent(
  e: React.PointerEvent | React.TouchEvent | React.MouseEvent
): {
  clientX: number;
  clientY: number;
  pointerId?: number;
} {
  if ("touches" in e && e.touches.length > 0) {
    // Touch event
    const touch = e.touches[0];
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
      pointerId: touch.identifier,
    };
  } else if ("changedTouches" in e && e.changedTouches.length > 0) {
    // Touch end event
    const touch = e.changedTouches[0];
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
      pointerId: touch.identifier,
    };
  } else {
    // Mouse or pointer event
    return {
      clientX: (e as React.PointerEvent).clientX,
      clientY: (e as React.PointerEvent).clientY,
      pointerId: (e as React.PointerEvent).pointerId,
    };
  }
}

/**
 * Check if two touch points are close enough to be considered the same
 */
export function isSameTouchPoint(
  point1: { x: number; y: number },
  point2: { x: number; y: number },
  threshold: number = 10
): boolean {
  const distance = Math.hypot(point1.x - point2.x, point1.y - point2.y);
  return distance <= threshold;
}

/**
 * Debounce function for touch events to prevent rapid firing
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
