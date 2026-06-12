import { song_detail, song_url_v1, lyric } from "NeteaseCloudMusicApi";

// The NeteaseCloudMusicApi types are minimal, so we use any for the response bodies.
// All runtime values are correct - this is only a TypeScript typing limitation.

export async function getSongDetail(songId: string): Promise<any> {
  const result: any = await song_detail({ ids: songId });
  if (result.status !== 200 || !result.body?.songs?.length) {
    throw new Error("Song not found");
  }
  return result.body.songs[0];
}

export async function getSongUrl(songId: string): Promise<{ url: string | null; br: number }> {
  const result: any = await song_url_v1({ id: songId, level: "exhigh" as any });
  if (result.status !== 200 || !result.body?.data?.length) {
    return { url: null, br: 0 };
  }
  return { url: result.body.data[0].url || null, br: result.body.data[0].br || 0 };
}

export async function getLyric(songId: string): Promise<{ lyric: string; tLyric: string }> {
  const result: any = await lyric({ id: songId });
  if (result.status !== 200) return { lyric: "", tLyric: "" };
  return {
    lyric: result.body?.lrc?.lyric || "",
    tLyric: result.body?.tlyric?.lyric || "",
  };
}

export async function resolveShortLink(shortUrl: string): Promise<string | null> {
  try {
    const res = await fetch(shortUrl, { redirect: "manual" });
    const location = res.headers.get("location") || "";
    const match = location.match(/[?&]id=(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function fetchAsBuffer(url: string): Promise<Uint8Array> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: "https://music.163.com/",
    },
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}
