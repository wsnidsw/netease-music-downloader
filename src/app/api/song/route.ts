import { NextRequest, NextResponse } from "next/server";
import { parseSongId, parseShortLinkResponse } from "@/lib/utils";
import { getSongDetail, getSongUrl, getLyric, resolveShortLink } from "@/lib/api";

export async function GET(request: NextRequest) {
  const link = request.nextUrl.searchParams.get("link");
  if (!link) {
    return NextResponse.json({ error: "Missing link parameter" }, { status: 400 });
  }

  try {
    let songId = parseSongId(link);

    if (songId === "__SHORT_LINK__") {
      const resolved = await resolveShortLink(link);
      if (!resolved) {
        songId = null;
      } else {
        songId = resolved;
      }
    }

    if (!songId) {
      return NextResponse.json({ error: "Could not parse song ID from link" }, { status: 400 });
    }

    const [detail, urlData, lyricData] = await Promise.all([
      getSongDetail(songId),
      getSongUrl(songId),
      getLyric(songId),
    ]);

    const artist = (detail.ar || []).map((a: any) => a.name).join(" / ");
    return NextResponse.json({
      id: detail.id.toString(),
      name: detail.name,
      artist,
      album: (detail.al || {}).name || "Unknown",
      coverUrl: (detail.al || {}).picUrl || "",
      audioUrl: urlData.url,
      audioBr: urlData.br,
      lyric: lyricData.lyric,
      tLyric: lyricData.tLyric,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
