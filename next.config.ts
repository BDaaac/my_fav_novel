import type { NextConfig } from "next";

// PAGES=1 — статическая сборка для GitHub Pages: сайт живёт в подпапке /my_fav_novel,
// картинки отдаются как есть (на Pages нет сервера, который бы их сжимал).
const pages = process.env.PAGES === "1";

const nextConfig: NextConfig = pages
  ? { output: "export", distDir: ".next-pages", basePath: "/my_fav_novel", trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
