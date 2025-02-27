#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

console.log('Running dependency fix script...');

// Function to download file from URL to destination
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Function to extract tarball
function extractTarball(tarballPath, extractTo) {
  execSync(`tar -xzf ${tarballPath} -C ${extractTo}`, { stdio: 'inherit' });
}

// Main function to fix dependencies
async function fixDependencies() {
  try {
    // Get node_modules path
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      fs.mkdirSync(nodeModulesPath, { recursive: true });
    }

    // Fix three-bmfont-text
    const packageName = 'three-bmfont-text';
    const packagePath = path.join(nodeModulesPath, packageName);
    
    if (!fs.existsSync(packagePath)) {
      console.log(`Fixing ${packageName}...`);
      fs.mkdirSync(packagePath, { recursive: true });
      
      // Download from npm registry directly
      const tarballUrl = 'https://registry.npmjs.org/three-bmfont-text/-/three-bmfont-text-2.4.0.tgz';
      const tarballPath = path.join(nodeModulesPath, `${packageName}.tgz`);
      
      console.log(`Downloading ${packageName} from ${tarballUrl}...`);
      await downloadFile(tarballUrl, tarballPath);
      
      console.log(`Extracting ${packageName}...`);
      const tempExtractPath = path.join(nodeModulesPath, 'temp-extract');
      fs.mkdirSync(tempExtractPath, { recursive: true });
      
      extractTarball(tarballPath, tempExtractPath);
      
      // Copy from the package directory (which is inside the tarball as "package")
      execSync(`cp -R ${path.join(tempExtractPath, 'package')}/* ${packagePath}`, { stdio: 'inherit' });
      
      // Clean up
      fs.rmSync(tarballPath, { force: true });
      fs.rmSync(tempExtractPath, { recursive: true, force: true });
      
      console.log(`Successfully installed ${packageName}`);
    } else {
      console.log(`${packageName} already installed, skipping`);
    }
    
    console.log('Dependency fix completed successfully');
  } catch (error) {
    console.error('Error fixing dependencies:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixDependencies(); 