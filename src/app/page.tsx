"use client";

import { useState, useEffect } from "react";

interface SongInfo {
  id: string;
  name: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string | null;
  audioBr: number;
  lyric: string;
  tLyric: string;
}

const DOWNLOAD_LABELS: Record<string, string> = {
  audio: "MP3 音频",
  cover: "封面图片",
  lyric: "歌词",
  all: "全部文件 (ZIP)",
};

export default function Home() {
  const [link, setLink] = useState("");
  const [songInfo, setSongInfo] = useState<SongInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState({ audio: true, cover: true, lyric: true });
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Shutdown server when page is closed
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon("/api/shutdown");
    };
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleParse() {
    if (!link.trim()) return;
    setLoading(true);
    setError(null);
    setSongInfo(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(`/api/song?link=${encodeURIComponent(link.trim())}`, { signal: controller.signal });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch {
        if (text.includes("<!DOCTYPE")) throw new Error("服务器无法访问网易 API，请使用本地版本");
        throw new Error("解析失败，请检查链接是否正确");
      }
      if (!res.ok) throw new Error(data.error || "请求失败");
      setSongInfo(data);
      setDownloads({ audio: !!data.audioUrl, cover: !!data.coverUrl, lyric: true });
    } catch (e: any) {
      if (e.name === "AbortError") setError("请求超时（30s），请检查网络后重试");
      else setError(e.message || "解析失败，请检查链接是否正确");
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  async function handleDownload(type: "audio" | "cover" | "lyric" | "all") {
    if (!songInfo) return;
    setDownloading(type);
    try {
      const url = `/api/download/${type}?songId=${songInfo.id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      showToast(`✅ ${DOWNLOAD_LABELS[type]} 已下载完成`);
    } catch {
      showToast("❌ 下载失败，请重试");
    }
    setTimeout(() => setDownloading(null), 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleParse();
  }

  const hasSelection = downloads.audio || downloads.cover || downloads.lyric;

  return (
    <div className="flex flex-col items-center px-4 py-8 sm:py-16 min-h-screen">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card px-5 py-3 text-sm text-white/90 animate-in shadow-xl">
          {toast}
        </div>
      )}

      <div className="text-center mb-10 animate-in">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          <span className="text-white/90">网易云音乐</span>{" "}
          <span className="text-[#ec4141]">下载</span>
        </h1>
        <p className="text-white/40 text-sm sm:text-base">粘贴分享链接，下载 MP3 · 封面 · 歌词</p>
      </div>

      <div className="glass-card w-full max-w-2xl p-5 sm:p-6 mb-8 animate-in">
        <div className="flex gap-3">
          <input
            type="text" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="粘贴分享链接，如 https://music.163.com/song?id=xxx"
            className="glass-input flex-1 px-4 py-3 text-sm sm:text-base" disabled={loading}
          />
          <button onClick={handleParse} disabled={loading || !link.trim()} className="btn-primary px-6 py-3 text-sm sm:text-base whitespace-nowrap">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                解析中
              </span>
            ) : ("解析")}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {songInfo && (
        <div className="glass-card w-full max-w-2xl p-5 sm:p-6 animate-in">
          <div className="flex gap-4 sm:gap-5 mb-5">
            {songInfo.coverUrl ? (
              <img src={songInfo.coverUrl} alt={songInfo.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover flex-shrink-0 shadow-lg" />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center text-white/20 text-4xl">♪</div>
            )}
            <div className="flex flex-col justify-center min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-white/90 truncate">{songInfo.name}</h2>
              <p className="text-white/50 text-sm mt-1 truncate">{songInfo.artist}</p>
              <p className="text-white/30 text-xs mt-0.5 truncate">{songInfo.album}</p>
              {songInfo.audioBr > 0 && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-white/10 text-white/40">
                  {songInfo.audioBr >= 320000 ? "320kbps" : songInfo.audioBr >= 128000 ? "128kbps" : `${Math.round(songInfo.audioBr / 1000)}kbps`}
                </span>
              )}
            </div>
          </div>

          {songInfo.lyric && (
            <div className="mb-5">
              <p className="text-xs text-white/30 mb-2">歌词预览</p>
              <div className="lyrics-scroll max-h-36 overflow-y-auto text-sm text-white/50 leading-relaxed p-3 rounded-xl bg-white/[0.03]">
                {songInfo.lyric.split("\n").filter((l) => l.trim()).slice(0, 12).map((line, i) => {
                  const text = line.replace(/\[\d{2}:\d{2}[.:]\d{2,3}\]/g, "").trim();
                  return text ? <p key={i}>{text}</p> : null;
                })}
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.06] pt-5">
            <p className="text-xs text-white/30 mb-3">选择下载内容</p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={downloads.audio} disabled={!songInfo.audioUrl} onChange={(e) => setDownloads((d) => ({ ...d, audio: e.target.checked }))} className="checkbox-custom" />
                <span className={`text-sm ${songInfo.audioUrl ? "text-white/70" : "text-white/20 line-through"}`}>MP3 音频</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={downloads.cover} onChange={(e) => setDownloads((d) => ({ ...d, cover: e.target.checked }))} className="checkbox-custom" />
                <span className="text-sm text-white/70">封面图片</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={downloads.lyric} onChange={(e) => setDownloads((d) => ({ ...d, lyric: e.target.checked }))} className="checkbox-custom" />
                <span className="text-sm text-white/70">歌词 LRC</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              {downloads.audio && songInfo.audioUrl && (
                <button onClick={() => handleDownload("audio")} disabled={downloading !== null} className="btn-primary px-4 py-2.5 text-sm">
                  {downloading === "audio" ? "下载中..." : "下载 MP3"}
                </button>
              )}
              {downloads.cover && (
                <button onClick={() => handleDownload("cover")} disabled={downloading !== null} className="btn-primary px-4 py-2.5 text-sm">
                  {downloading === "cover" ? "下载中..." : "下载封面"}
                </button>
              )}
              {downloads.lyric && (
                <button onClick={() => handleDownload("lyric")} disabled={downloading !== null} className="btn-primary px-4 py-2.5 text-sm">
                  {downloading === "lyric" ? "下载中..." : "下载歌词"}
                </button>
              )}
              {hasSelection && (
                <button onClick={() => handleDownload("all")} disabled={downloading !== null} className="px-4 py-2.5 text-sm rounded-xl font-semibold border border-[#ec4141]/40 text-[#ec4141] hover:bg-[#ec4141]/10 transition-colors">
                  {downloading === "all" ? "打包中..." : "下载全部"}
                </button>
              )}
            </div>

            {!songInfo.audioUrl && (
              <p className="mt-3 text-xs text-amber-400/70">⚠ 该歌曲暂无可用音频源（可能需 VIP 或受版权保护）</p>
            )}
          </div>
        </div>
      )}

      <p className="mt-12 text-xs text-white/20 text-center max-w-md leading-relaxed">
        仅供个人学习使用 · 请支持正版音乐
      </p>
    </div>
  );
}