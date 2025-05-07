/**
 * Fixes the position of a tooltip. Should be used as mouseover-event for the parent.
 * Inspired by: https://stackoverflow.com/questions/50970336/prevent-css-tooltip-from-going-out-of-page-window
 * @param parent Parent of the Tooltip
 * @param tooltip Tooltip Element
 */
export function fixTooltipPosition(
  parent: HTMLElement | undefined | null,
  tooltip: HTMLElement | undefined | null
): void {
  if (!parent || !tooltip) return;

  // Get calculated parent coordinates and size
  const parent_rect = parent.getBoundingClientRect();

  let tipX = 0;
  let tipY = parent_rect.height;
  // Position tooltip
  tooltip.style.top = tipY + "px";
  tooltip.style.left = tipX + "px";

  // Get calculated tooltip coordinates and size
  const tooltip_rect = tooltip.getBoundingClientRect();
  // Corrections if out of window
  if (tooltip_rect.x + tooltip_rect.width > window.innerWidth)
    // Out on the right
    tipX = -tooltip_rect.width + parent_rect.width; // Simulate a "right: tipX" position
  if (tooltip_rect.y + tooltip_rect.height > window.innerHeight)
    // Out on the top
    tipY = -tooltip_rect.height; // Align on the top

  // Apply corrected position
  tooltip.style.top = tipY + "px";
  tooltip.style.left = tipX + "px";
}
