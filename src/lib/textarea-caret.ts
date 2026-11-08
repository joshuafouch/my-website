export function placeCaret(area: HTMLTextAreaElement, cursor: number) {
  const next = Math.max(0, Math.min(cursor, area.value.length));
  area.focus({ preventScroll: true });
  area.setSelectionRange(next, next);
  area.scrollTop = caretScroll(area, next);
}

function caretScroll(area: HTMLTextAreaElement, cursor: number): number {
  const style = getComputedStyle(area);
  const padLeft = parseFloat(style.paddingLeft) || 0;
  const padRight = parseFloat(style.paddingRight) || 0;
  const padTop = parseFloat(style.paddingTop) || 0;
  const mirror = document.createElement('div');
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.left = '0';
  mirror.style.top = '0';
  mirror.style.height = 'auto';
  mirror.style.overflow = 'hidden';
  mirror.style.boxSizing = 'content-box';
  mirror.style.width = `${Math.max(0, area.clientWidth - padLeft - padRight)}px`;
  mirror.style.padding = '0';
  mirror.style.border = '0';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordBreak = 'break-word';
  mirror.style.overflowWrap = 'break-word';
  mirror.style.fontFamily = style.fontFamily;
  mirror.style.fontSize = style.fontSize;
  mirror.style.fontWeight = style.fontWeight;
  mirror.style.fontStyle = style.fontStyle;
  mirror.style.letterSpacing = style.letterSpacing;
  mirror.style.lineHeight = style.lineHeight;
  mirror.style.tabSize = style.tabSize;
  mirror.textContent = area.value.slice(0, cursor);
  const marker = document.createElement('span');
  marker.textContent = area.value.slice(cursor, cursor + 1) || '\u200b';
  mirror.append(marker);
  document.body.append(mirror);
  const top = padTop + marker.offsetTop;
  mirror.remove();
  return Math.max(0, top - area.clientHeight / 3);
}
