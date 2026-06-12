export function parseSongId(input: string): string | null {
  const trimmed = input.trim();
  const songMatch = trimmed.match(/[?&]id=(\d+)/);
  if (songMatch) return songMatch[1];
  if (trimmed.includes("163cn.tv")) return "__SHORT_LINK__";
  return null;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim();
}

export function lrcToPlainText(lrc: string): string {
  if (!lrc) return "";
  return lrc
    .split("\n")
    .map((line) => line.replace(/\[\d{2}:\d{2}[.:]\d{2,3}\]/g, "").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

export function parseShortLinkResponse(url: string): string | null {
  const match = url.match(/[?&]id=(\d+)/);
  return match ? match[1] : null;
}
