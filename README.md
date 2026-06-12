# 网易云音乐下载站

粘贴网易云音乐分享链接，下载 MP3 音频、封面图片、歌词。支持单独下载或一键打包 ZIP。

> ⚠️ Vercel 等海外平台部署后无法访问网易 API（geo-block），推荐本地使用。

## 快速开始

```bash
git clone https://github.com/wsnidsw/netease-music-downloader.git
cd netease-music-downloader
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 支持的链接格式

- `https://music.163.com/song?id=123456`
- `https://music.163.com/#/song?id=123456`
- `https://y.music.163.com/m/song?id=123456`
- `https://163cn.tv/xxxxx` (短链接)

## 功能

- 粘贴链接 → 自动解析歌曲信息、封面、歌词
- 选择性下载：MP3（最高 320kbps）/ 封面图片 / 歌词 LRC
- 一键打包全部为 ZIP
- 暗色毛玻璃风格界面

## 技术栈

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- NeteaseCloudMusicApi
- JSZip
