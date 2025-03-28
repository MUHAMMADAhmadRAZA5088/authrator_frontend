#!/bin/bash

# Script to generate macOS icon set from PNG
# Requires: ImageMagick (convert command)

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required but not installed. Please install it first."
    exit 1
fi

# Source PNG file
SOURCE="assets/icon.png"

# Create iconset directory if it doesn't exist
mkdir -p icons.iconset

# Generate different sizes
convert "$SOURCE" -resize 16x16 icons.iconset/icon_16x16.png
convert "$SOURCE" -resize 32x32 icons.iconset/icon_16x16@2x.png
convert "$SOURCE" -resize 32x32 icons.iconset/icon_32x32.png
convert "$SOURCE" -resize 64x64 icons.iconset/icon_32x32@2x.png
convert "$SOURCE" -resize 128x128 icons.iconset/icon_128x128.png
convert "$SOURCE" -resize 256x256 icons.iconset/icon_128x128@2x.png
convert "$SOURCE" -resize 256x256 icons.iconset/icon_256x256.png
convert "$SOURCE" -resize 512x512 icons.iconset/icon_256x256@2x.png
convert "$SOURCE" -resize 512x512 icons.iconset/icon_512x512.png
convert "$SOURCE" -resize 1024x1024 icons.iconset/icon_512x512@2x.png

# Create icns file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS command
    iconutil -c icns icons.iconset -o assets/icon.icns
    echo "Created assets/icon.icns using iconutil"
else
    echo "This script requires macOS to create the .icns file."
    echo "Please run this on a macOS machine or use a different tool on your platform."
    exit 1
fi

# Clean up
rm -rf icons.iconset

echo "Icon conversion completed." 