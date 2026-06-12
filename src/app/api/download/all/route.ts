import { NextRequest, NextResponse } from "next/server";
import { getSongDetail, getSongUrl, getLyric, fetchAsBuffer } from "@/lib/api";
import { sanitizeFilename, lrcToPlainText } from "@/lib/utils";
import JSZip from "jszip";

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get("songId");
  if (!songId) {
    return NextResponse.json({ error: "Missing songId" }, { status: 400 });
  }

  try {
    const [detail, urlData, lyricData] = await Promise.all([
      getSongDetail(songId),
      getSongUrl(songId),
      getLyric(songId),
    ]);

    const artist = (detail.ar || []).map((a: any) => a.name).join(" / ");
    const baseName = sanitizeFilename(`${artist} - ${detail.name}`);
    const zip = new JSZip();
    const folder = zip.folder(baseName);

    const coverUrl = (detail.al || {}).picUrl;
    if (coverUrl && folder) {
      try {
        const coverBuffer = await fetchAsBuffer(coverUrl);
        const ext = coverUrl.includes(".jpg") ? "jpg" : "png";
        folder.file(`cover.${ext}`, coverBuffer);
      } catch { /* ignore */ }
    }

    if (urlData.url && folder) {
      try {
        const audioBuffer = await fetchAsBuffer(urlData.url);
        folder.file(`${baseName}.mp3`, audioBuffer);
      } catch { /* ignore */ }
    }

    if (folder) {
      if (lyricData.lyric && lyricData.lyric.trim()) {
        folder.file(`${baseName}.lrc`, lyricData.lyric);
        folder.file(`${baseName}-歌词.txt`, lrcToPlainText(lyricData.lyric));
      } else {
        folder.file("歌词.txt", "纯音乐，暂无歌词");
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const body = zipBuffer.buffer as ArrayBuffer;
    const filename = `${baseName}.zip`;

    return new Response(body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
