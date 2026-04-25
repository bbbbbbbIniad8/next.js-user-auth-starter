import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 外部パッケージとして扱うことでNode.js環境でのみ読み込ませる
  serverExternalPackages: ["../generated/prisma"],
};

export default nextConfig;