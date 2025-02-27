#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running dependency fix script...');

// Create directory for script if it doesn't exist
const scriptDir = path.join(process.cwd(), 'scripts');
if (!fs.existsSync(scriptDir)) {
  fs.mkdirSync(scriptDir, { recursive: true });
}

// Function to manually download and install GitHub packages without using SSH
function downloadAndInstallPackage(packageName, repoUrl, version) {
  console.log(`Fixing dependency: ${packageName}...`);
  
  try {
    // Check if package exists in node_modules
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    const exists = fs.existsSync(packagePath);
    
    // If it doesn't exist or is incomplete, fetch it manually
    if (!exists) {
      const tempDir = path.join(scriptDir, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Use HTTPS to clone or download
      const httpsUrl = repoUrl.replace('git@github.com:', 'https://github.com/');
      
      console.log(`Installing ${packageName} from ${httpsUrl}...`);
      
      try {
        // First try to use npm directly (more reliable)
        execSync(`npm install ${packageName}@${version} --no-save --force`, {
          stdio: 'inherit'
        });
      } catch (error) {
        console.log(`Failed to install via npm, attempting manual install...`);
        
        // If that fails, try direct HTTPS clone
        execSync(`git clone ${httpsUrl} ${path.join(tempDir, packageName)}`, {
          stdio: 'inherit',
          env: {
            ...process.env,
            GIT_TERMINAL_PROMPT: '0'
          }
        });
        
        // Copy the downloaded package to node_modules
        fs.mkdirSync(packagePath, { recursive: true });
        execSync(`cp -R ${path.join(tempDir, packageName)}/* ${packagePath}`, {
          stdio: 'inherit'
        });
        
        // Run install in the package directory if it has a package.json
        if (fs.existsSync(path.join(packagePath, 'package.json'))) {
          execSync('npm install --production', {
            cwd: packagePath,
            stdio: 'inherit'
          });
        }
      }
      
      console.log(`Successfully installed ${packageName}`);
    } else {
      console.log(`${packageName} already exists, skipping.`);
    }
  } catch (error) {
    console.error(`Error fixing ${packageName}:`, error.message);
  }
}

// Fix three-bmfont-text package
downloadAndInstallPackage(
  'three-bmfont-text',
  'https://github.com/dmarcos/three-bmfont-text.git',
  '2.4.0'
);

// Check for other potential problematic packages here
// Add more packages if needed

console.log('Dependency fix script completed.'); 