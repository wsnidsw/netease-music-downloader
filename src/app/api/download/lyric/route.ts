import { NextRequest, NextResponse } from "next/server";
import { getSongDetail, getLyric } from "@/lib/api";
import { sanitizeFilename, lrcToPlainText } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get("songId");
  if (!songId) {
    return NextResponse.json({ error: "Missing songId" }, { status: 400 });
  }

  try {
    const [detail, lyricData] = await Promise.all([
      getSongDetail(songId),
      getLyric(songId),
    ]);

    const artist = (detail.ar || []).map((a: any) => a.name).join(" / ");
    const baseName = sanitizeFilename(`${artist} - ${detail.name}`);
    const hasLyric = lyricData.lyric && lyricData.lyric.trim().length > 0;

    const content = hasLyric
      ? `[LRC]\n${lyricData.lyric}\n\n[TXT - 纯文本歌词]\n${lrcToPlainText(lyricData.lyric)}`
      : `纯音乐，暂无歌词`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(baseName + ".lrc.txt")}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
