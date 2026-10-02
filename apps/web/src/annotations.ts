export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}
/** Position relative to the video content, excluding object-fit:contain letterboxing. */
export function contentBox(
  container: Box,
  videoWidth: number,
  videoHeight: number,
): Box {
  if (!videoWidth || !videoHeight || !container.width || !container.height)
    return container;
  const scale = Math.min(
      container.width / videoWidth,
      container.height / videoHeight,
    ),
    width = videoWidth * scale,
    height = videoHeight * scale;
  return {
    left: container.left + (container.width - width) / 2,
    top: container.top + (container.height - height) / 2,
    width,
    height,
  };
}
export function normalizedPoint(
  x: number,
  y: number,
  box: Box,
): { x: number; y: number } | null {
  if (
    box.width <= 0 ||
    box.height <= 0 ||
    x < box.left ||
    x > box.left + box.width ||
    y < box.top ||
    y > box.top + box.height
  )
    return null;
  return { x: (x - box.left) / box.width, y: (y - box.top) / box.height };
}
