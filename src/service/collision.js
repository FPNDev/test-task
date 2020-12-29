/** @deprecated allowed to put elements on top of each other */
export function collides(element, otherElement) {
  const bounds = element.getBoundingClientRect();
  const otherBounds = otherElement.getBoundingClientRect();

  return bounds.bottom >= otherBounds.top && bounds.right >= otherBounds.left && bounds.left <= otherBounds.right;
}

export function collidesLine(element, lineElement, angle) {
  const bounds = element.getBoundingClientRect();
  const lineBounds = lineElement.getBoundingClientRect();

  const lineWidth = lineElement.offsetWidth;
  const pointOnLine = lineWidth - (bounds.left - lineBounds.left);

  const topModifier = Math.sin((Math.PI / 180) * angle) * pointOnLine;

  return bounds.bottom > (angle > 0 ? lineBounds.bottom - topModifier : lineBounds.top - topModifier);
}