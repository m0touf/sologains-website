#!/bin/bash

echo "🧹 Cleaning build files..."

# Remove client build files
if [ -d "client/dist" ]; then
    echo "Removing client/dist..."
    rm -rf client/dist
fi

# Remove server build files
echo "Removing server build files..."
find server/src -name "*.js" -o -name "*.js.map" -o -name "*.d.ts" -o -name "*.d.ts.map" | xargs rm -f

# Remove prisma build files
echo "Removing prisma build files..."
find server/prisma -name "*.js" -o -name "*.js.map" -o -name "*.d.ts" -o -name "*.d.ts.map" | xargs rm -f

# Remove any remaining map files
echo "Removing any remaining map files..."
find . -name "*.map" -not -path "*/node_modules/*" -delete

# Remove any other build directories
find . -name "build" -type d -not -path "./node_modules/*" -not -path "./*/node_modules/*" | xargs rm -rf 2>/dev/null || true

echo "✅ Build files cleaned!"
echo ""
echo "💡 Tip: Run this script whenever you see build files appearing in your project."
