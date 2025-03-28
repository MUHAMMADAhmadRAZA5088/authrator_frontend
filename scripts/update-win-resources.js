const rcedit = require('rcedit');
const path = require('path');
const fs = require('fs');

// Get the package.json to read app metadata
const packageJson = require('../package.json');

// This script is meant to be run after electron-builder creates the Windows executable
// Usage: node scripts/update-win-resources.js <path-to-exe>

async function updateResources() {
    if (process.argv.length < 3) {
        console.error('Please provide the path to the executable');
        process.exit(1);
    }

    const exePath = process.argv[2];
    console.log(`Updating resources for: ${exePath}`);

    if (!fs.existsSync(exePath)) {
        console.error(`File not found: ${exePath}`);
        process.exit(1);
    }

    const iconPath = path.resolve(__dirname, '../assets/icon.ico');
    
    if (!fs.existsSync(iconPath)) {
        console.error(`Icon not found: ${iconPath}`);
        process.exit(1);
    }

    try {
        await rcedit(exePath, {
            'version-string': {
                ProductName: packageJson.build.productName,
                FileDescription: packageJson.build.productName,
                CompanyName: packageJson.build.productName,
                LegalCopyright: `© ${new Date().getFullYear()} ${packageJson.build.productName}`,
                OriginalFilename: `${packageJson.build.productName}.exe`,
                InternalName: packageJson.build.productName,
                // The file version is important for Windows
                FileVersion: packageJson.version,
                ProductVersion: packageJson.version,
            },
            'file-version': packageJson.version,
            'product-version': packageJson.version,
            icon: iconPath,
            'requested-execution-level': packageJson.build.win.requestedExecutionLevel || 'asInvoker',
            'application-manifest': undefined
        });
        console.log('Resources updated successfully');
    } catch (error) {
        console.error('Error updating resources:', error);
        process.exit(1);
    }
}

updateResources().catch(console.error); 