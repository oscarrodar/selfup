/** Legacy entries were plain text; convert them to paragraphs so line breaks survive. */
export function toHtml(value: string): string {
  if (!value) return "";
  if (/^\s*</.test(value)) return value;
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return value.split(/\n/).map(line => `<p>${escape(line)}</p>`).join("");
}

/** Plain-text view of stored content (HTML or legacy plain text). */
export function toPlainText(value: string): string {
  if (!value) return "";
  if (!/^\s*</.test(value)) return value;
  const doc = new DOMParser().parseFromString(value, "text/html");
  doc.querySelectorAll("p, li, h1, h2, h3, blockquote").forEach(el => el.append(" "));
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}
