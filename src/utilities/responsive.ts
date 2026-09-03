import { useWindowDimensions } from 'react-native';

/** Screens at or above this width are treated as tablets (e.g. iPad). */
export const TABLET_BREAKPOINT = 768;

/** Comfortable max width for a single content column on large screens. */
export const MAX_CONTENT_WIDTH = 600;

/**
 * Caps and centers scroll/list content on tablets so cards and full-width
 * buttons don't stretch edge-to-edge, while leaving phone layouts untouched.
 */
export function useResponsiveContentStyle() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  return isTablet
    ? { alignSelf: 'center' as const, width: '100%' as const, maxWidth: MAX_CONTENT_WIDTH }
    : undefined;
}
