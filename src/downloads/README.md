# Desktop Client Download Directory

This directory should contain the actual executable files for the Authrator desktop client.

## Expected Files

1. `authrator-win.exe` - Windows executable (portable version)
2. `authrator-mac.dmg` - macOS disk image
3. `authrator-linux.AppImage` - Linux AppImage

## Instructions for Developers

When building the desktop version of Authrator, place the production builds in this directory with the exact filenames listed above to ensure the download functionality works properly.

## Download Handler

The download functionality is managed by the `download-handler.js` script in the parent directory. This script detects the user's operating system and initiates the download of the appropriate executable file.

## File Sizes

For reference, here are the expected file sizes for each executable:
- Windows: ~70-100 MB
- macOS: ~80-110 MB
- Linux: ~70-90 MB

These sizes may vary depending on the bundled dependencies and build configuration. 