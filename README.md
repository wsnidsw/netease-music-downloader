# 网易云音乐下载站

> 🌐 **在线使用：[wyy-sooty.vercel.app](https://wyy-sooty.vercel.app)**

粘贴网易云音乐分享链接，下载 MP3 音频、封面图片、歌词。支持单独下载或一键打包 ZIP。零外部依赖，一个项目搞定。

## 快速开始

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`，粘贴网易云分享链接即可。

## 部署到 Vercel

直接推送仓库，Vercel 自动部署。无需额外环境变量或后端服务。

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
- NeteaseCloudMusicApi (内置 npm 包，无需外部服务)
- JSZip
