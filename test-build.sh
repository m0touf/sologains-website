#!/bin/bash

# Test Build Script for SoloGains
echo "🧪 SoloGains Build Test"
echo "======================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Test server build
echo "🔨 Testing server build..."
cd server && npm run build
if [ $? -ne 0 ]; then
    echo "❌ Server build failed!"
    exit 1
fi
echo "✅ Server build successful!"

# Test client build
echo "🔨 Testing client build..."
cd ../client && npm run build
if [ $? -ne 0 ]; then
    echo "❌ Client build failed!"
    exit 1
fi
echo "✅ Client build successful!"

# Test root build
echo "🔨 Testing root build..."
cd .. && npm run build
if [ $? -ne 0 ]; then
    echo "❌ Root build failed!"
    exit 1
fi
echo "✅ Root build successful!"

echo ""
echo "🎉 All builds successful!"
echo "📋 Build Status:"
echo "  ✅ Server: Ready"
echo "  ✅ Client: Ready"
echo "  ✅ Root: Ready"
echo ""
echo "🚀 Ready for deployment!"
