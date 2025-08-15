#!/usr/bin/env node

/**
 * 🚀 ULTIMATE COURSE NAVIGATOR UPGRADE SCRIPT
 * 
 * This script performs a seamless upgrade from the current version
 * to the ULTIMATE enhanced version with all the spectacular new features!
 * 
 * Features being added:
 * - 🗺️ Interactive Graph Minimap
 * - 🔍 Advanced Search & Filters
 * - 🎯 Learning Path Builder
 * - 🤖 AI-Powered Recommendations
 * - 📊 Progress Dashboard
 * - 🕸️ Interactive Network Visualization
 * - ⚡ Performance Optimizations
 * - 🎨 Enhanced UI/UX
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting ULTIMATE Course Navigator Upgrade...\n');

const projectRoot = process.cwd();
const frontendPath = path.join(projectRoot, 'frontend', 'src');

// Backup current App.js
const currentAppPath = path.join(frontendPath, 'App.js');
const backupAppPath = path.join(frontendPath, 'App_Backup.js');
const enhancedAppPath = path.join(frontendPath, 'App_Enhanced.js');

function createBackup() {
  console.log('📦 Creating backup of current App.js...');
  
  if (fs.existsSync(currentAppPath)) {
    fs.copyFileSync(currentAppPath, backupAppPath);
    console.log('✅ Backup created at App_Backup.js\n');
  } else {
    console.log('⚠️ No current App.js found, proceeding with fresh installation...\n');
  }
}

function upgradeApp() {
  console.log('⬆️ Upgrading to Enhanced App.js...');
  
  if (fs.existsSync(enhancedAppPath)) {
    fs.copyFileSync(enhancedAppPath, currentAppPath);
    console.log('✅ App.js upgraded to ULTIMATE version!\n');
  } else {
    console.log('❌ Enhanced App.js not found. Please ensure all files are in place.\n');
    process.exit(1);
  }
}

function verifyFiles() {
  console.log('🔍 Verifying all enhanced components are in place...');
  
  const requiredFiles = [
    'components/AdvancedFeatures.js',
    'components/IntelligentFeatures.js',
    'components/DataVisualization.js',
    'styles/UltimateFeatures.css'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(frontendPath, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing required files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('\nPlease ensure all enhanced components are created first.\n');
    process.exit(1);
  }
  
  console.log('✅ All enhanced components verified!\n');
}

function updatePackageJson() {
  console.log('📝 Checking package.json for new dependencies...');
  
  const packageJsonPath = path.join(projectRoot, 'frontend', 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add any new dependencies if needed
    const newDependencies = {
      // Add any new packages here if required
    };
    
    let hasUpdates = false;
    Object.entries(newDependencies).forEach(([pkg, version]) => {
      if (!packageJson.dependencies[pkg]) {
        packageJson.dependencies[pkg] = version;
        hasUpdates = true;
        console.log(`   + Adding ${pkg}@${version}`);
      }
    });
    
    if (hasUpdates) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ package.json updated!\n');
      console.log('📦 Run "npm install" to install new dependencies.\n');
    } else {
      console.log('✅ No new dependencies required!\n');
    }
  }
}

function generateFeatureManifest() {
  console.log('📋 Generating feature manifest...');
  
  const manifest = {
    version: "2.0.0-ULTIMATE",
    name: "Enhanced Course Navigator",
    description: "The ultimate course visualization and planning tool",
    features: {
      "Interactive Graph Minimap": {
        icon: "🗺️",
        description: "Navigate large course graphs with ease",
        component: "GraphMinimap",
        status: "active"
      },
      "Advanced Search & Filters": {
        icon: "🔍",
        description: "Powerful search with intelligent filtering",
        component: "AdvancedSearchPanel",
        status: "active"
      },
      "Learning Path Builder": {
        icon: "🎯",
        description: "Create personalized learning journeys",
        component: "LearningPathBuilder",
        status: "active"
      },
      "AI Recommendations": {
        icon: "🤖",
        description: "Smart course suggestions powered by AI",
        component: "AIRecommendations",
        status: "active"
      },
      "Progress Dashboard": {
        icon: "📊",
        description: "Comprehensive learning analytics",
        component: "ProgressDashboard",
        status: "active"
      },
      "Network Visualization": {
        icon: "🕸️",
        description: "Interactive physics-based graph",
        component: "NetworkVisualization",
        status: "active"
      },
      "Multi-View Interface": {
        icon: "🖥️",
        description: "Switch between different visualization modes",
        component: "ViewSwitcher",
        status: "active"
      },
      "Enhanced Shortcuts": {
        icon: "⌨️",
        description: "Comprehensive keyboard navigation",
        component: "KeyboardShortcuts",
        status: "active"
      },
      "Performance Monitoring": {
        icon: "⚡",
        description: "Real-time performance metrics",
        component: "PerformanceProvider",
        status: "active"
      },
      "Modern Design System": {
        icon: "🎨",
        description: "Beautiful, accessible UI components",
        component: "EnhancedGlobal.css",
        status: "active"
      }
    },
    compatibility: {
      "React": ">=18.0.0",
      "Node.js": ">=16.0.0",
      "Modern Browsers": "ES2020+"
    },
    shortcuts: {
      "Ctrl+S": "Open Advanced Search",
      "Ctrl+P": "Open Learning Path Builder",
      "1-4": "Switch Views",
      "I": "Toggle Sidebar",
      "T": "Toggle Theme",
      "Escape": "Close Dialogs"
    },
    upgradeDate: new Date().toISOString(),
    previousVersion: "1.0.0-BASIC"
  };
  
  const manifestPath = path.join(frontendPath, 'FEATURE_MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('✅ Feature manifest created!\n');
  return manifest;
}

function printSuccessMessage(manifest) {
  console.log('🎉 ULTIMATE UPGRADE COMPLETED SUCCESSFULLY! 🎉\n');
  console.log('📋 NEW FEATURES ACTIVATED:');
  
  Object.entries(manifest.features).forEach(([name, feature]) => {
    console.log(`   ${feature.icon} ${name}`);
    console.log(`      ${feature.description}`);
  });
  
  console.log('\n⌨️ KEYBOARD SHORTCUTS:');
  Object.entries(manifest.shortcuts).forEach(([key, action]) => {
    console.log(`   ${key.padEnd(8)} → ${action}`);
  });
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('   1. Run "npm install" (if new dependencies were added)');
  console.log('   2. Start the development server: "npm start"');
  console.log('   3. Open http://localhost:3000');
  console.log('   4. Explore the new ULTIMATE features!');
  
  console.log('\n💡 TIP: Press Ctrl+K to open the command palette and discover all features!');
  console.log('\n🔄 ROLLBACK: If needed, restore from App_Backup.js');
  
  console.log('\n✨ Welcome to the ULTIMATE Course Navigator experience! ✨\n');
}

// Execute upgrade process
try {
  verifyFiles();
  createBackup();
  upgradeApp();
  updatePackageJson();
  const manifest = generateFeatureManifest();
  printSuccessMessage(manifest);
} catch (error) {
  console.error('❌ Upgrade failed:', error.message);
  console.log('\n🔄 Attempting rollback...');
  
  if (fs.existsSync(backupAppPath)) {
    fs.copyFileSync(backupAppPath, currentAppPath);
    console.log('✅ Rollback completed. Original App.js restored.');
  }
  
  process.exit(1);
}
