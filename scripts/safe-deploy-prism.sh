#!/usr/bin/env bash
set -euo pipefail
echo "1/2 Building Prism App Store production bundle..."
npm run build
echo "2/2 Verifying built dist/assets bundle..."
test -s dist/index.html
echo "✅ Prism App Store build verified with zero errors!"
