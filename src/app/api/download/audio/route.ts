import { NextRequest, NextResponse } from "next/server";
import { getSongDetail, getSongUrl, fetchAsBuffer } from "@/lib/api";
import { sanitizeFilename } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get("songId");
  if (!songId) {
    return NextResponse.json({ error: "Missing songId" }, { status: 400 });
  }

  try {
    const [detail, urlData] = await Promise.all([
      getSongDetail(songId),
      getSongUrl(songId),
    ]);

    if (!urlData.url) {
      return NextResponse.json({ error: "Audio not available (may require VIP or region lock)" }, { status: 403 });
    }

    const artist = (detail.ar || []).map((a: any) => a.name).join(" / ");
    const filename = `${sanitizeFilename(artist)} - ${sanitizeFilename(detail.name)}.mp3`;
    const data = await fetchAsBuffer(urlData.url);
    const body = data.buffer as ArrayBuffer;

    return new Response(body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": data.length.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
