const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Determine the current OS
const isMac = os.platform() === 'darwin';
const isWin = os.platform() === 'win32';

// Function to run shell commands
function runCommand(command) {
    console.log(`Executing: ${command}`);
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error);
        process.exit(1);
    }
}

// Main build process
async function build() {
    console.log('Starting build process...');
    
    // Generate icons if they don't exist
    if (!fs.existsSync(path.resolve(__dirname, '../assets/icon.ico')) ||
        !fs.existsSync(path.resolve(__dirname, '../assets/icon.icns'))) {
        console.log('Generating app icons...');
        runCommand('node scripts/generate-icons.js');
    }

    // Build React app first
    console.log('Building React application...');
    if (isWin) {
        runCommand('npm run build');
    } else if (isMac) {
        runCommand('npm run build:mac');
    } else {
        // Default to macOS-style build for Linux
        runCommand('npm run build:mac');
    }
    
    // Build for the current platform
    if (isWin) {
        console.log('Building Windows application...');
        runCommand('npx electron-builder --win portable');
        
        // Find the generated executable and update its resources
        const distDir = path.resolve(__dirname, '../dist');
        if (fs.existsSync(distDir)) {
            const files = fs.readdirSync(distDir);
            const exeFile = files.find(file => file.endsWith('.exe'));
            
            if (exeFile) {
                console.log('Updating Windows executable resources...');
                runCommand(`node scripts/update-win-resources.js "${path.join(distDir, exeFile)}"`);
            } else {
                console.error('Could not find the generated Windows executable');
            }
        } else {
            console.error('Dist directory not found. Build might have failed.');
        }
    } else if (isMac) {
        console.log('Building macOS application...');
        runCommand('npx electron-builder --mac');
    } else {
        console.log('Building for current platform...');
        runCommand('npx electron-builder');
    }
    
    console.log('Build process completed successfully!');
    console.log(`Binaries can be found in the dist/ directory.`);
}

// Run the build
build().catch(console.error); 