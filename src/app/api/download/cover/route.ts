import { NextRequest, NextResponse } from "next/server";
import { getSongDetail, fetchAsBuffer } from "@/lib/api";
import { sanitizeFilename } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get("songId");
  if (!songId) {
    return NextResponse.json({ error: "Missing songId" }, { status: 400 });
  }

  try {
    const detail = await getSongDetail(songId);
    const coverUrl = (detail.al || {}).picUrl;
    if (!coverUrl) {
      return NextResponse.json({ error: "Cover image not available" }, { status: 404 });
    }

    const artist = (detail.ar || []).map((a: any) => a.name).join(" / ");
    const ext = coverUrl.includes(".jpg") ? "jpg" : "png";
    const filename = `${sanitizeFilename(artist)} - ${sanitizeFilename(detail.name)}.${ext}`;
    const data = await fetchAsBuffer(coverUrl);
    const body = data.buffer as ArrayBuffer;

    return new Response(body, {
      headers: {
        "Content-Type": `image/${ext === "jpg" ? "jpeg" : "png"}`,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Content-Length": data.length.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
