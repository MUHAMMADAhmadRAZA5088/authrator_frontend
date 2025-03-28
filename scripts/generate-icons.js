const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the root directory of the project
const rootDir = path.resolve(__dirname, '..');
const iconBuilder = path.join(rootDir, 'node_modules', '.bin', 'electron-icon-builder');

// Make sure we have electron-icon-builder
if (!fs.existsSync(iconBuilder)) {
    console.error('electron-icon-builder not found. Please run: npm install -D electron-icon-builder');
    process.exit(1);
}

// Make sure we have the source icon
const sourceIcon = path.join(rootDir, 'assets', 'icon.png');
if (!fs.existsSync(sourceIcon)) {
    console.error(`Source icon not found: ${sourceIcon}`);
    process.exit(1);
}

console.log('Generating icons for all platforms...');

try {
    // Use electron-icon-builder to generate icons for all platforms
    const command = `${iconBuilder} --input="${sourceIcon}" --output=assets --flatten`;
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log('Icons generated successfully!');
    
    // The paths to the generated icons
    const icoPath = path.join(rootDir, 'assets', 'icons', 'icon.ico');
    const icnsPath = path.join(rootDir, 'assets', 'icons', 'icon.icns');
    
    console.log(`  - Windows: ${icoPath}`);
    console.log(`  - macOS: ${icnsPath}`);
    
    // Copy the ico file to assets directory for easier access
    if (fs.existsSync(icoPath)) {
        fs.copyFileSync(icoPath, path.join(rootDir, 'assets', 'icon.ico'));
        console.log('Windows icon copied to assets directory');
    } else {
        console.error(`Windows icon not found at: ${icoPath}`);
    }
    
    // Copy the icns file to assets directory for easier access
    if (fs.existsSync(icnsPath)) {
        fs.copyFileSync(icnsPath, path.join(rootDir, 'assets', 'icon.icns'));
        console.log('macOS icon copied to assets directory');
    } else {
        console.error(`macOS icon not found at: ${icnsPath}`);
    }
} catch (error) {
    console.error('Error generating icons:', error.message);
    process.exit(1);
} 