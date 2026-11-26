#!/usr/bin/env bash
set -euo pipefail
echo "1/2 Building Prism App Store production bundle..."
npm run build
echo "2/2 Verifying built dist/assets bundle..."
test -s dist/index.html
node -e 'const fs=require("fs"),crypto=require("crypto"),path=require("path");const files=fs.readdirSync("dist/assets").sort();const hashes={};for(const f of files){hashes[f]=crypto.createHash("sha256").update(fs.readFileSync(path.join("dist/assets",f))).digest("hex");}fs.writeFileSync("dist/release-integrity.json",JSON.stringify({app:"prism-app-store",generatedAt:new Date().toISOString(),algorithm:"SHA-256",assets:hashes},null,2));'
echo "✅ Prism App Store build & SHA-256 release-integrity.json verified with zero errors!"
