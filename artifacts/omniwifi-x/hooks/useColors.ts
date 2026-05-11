import colors from "@/constants/colors";

/**
 * OmniWiFi X always uses the dark theme — it's a security tool
 * and the dark cyber aesthetic is core to the product identity.
 */
export function useColors() {
  const palette = (colors as Record<string, typeof colors.light>).dark ?? colors.light;
  return { ...palette, radius: colors.radius };
}
