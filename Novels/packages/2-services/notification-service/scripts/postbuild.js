const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'dist', '2-services', 'notification-service', 'src');
const target = path.join(__dirname, '..', 'dist');

if (fs.existsSync(src) && !fs.existsSync(path.join(target, 'main.js'))) {
  console.log('Copying notification-service build artifacts to dist root...');
  fs.cpSync(src, target, { recursive: true });
  console.log('✓ Copied notification-service build artifacts to dist root.');
} else if (fs.existsSync(path.join(target, 'main.js'))) {
  console.log('✓ Notification-service build artifacts already exist in dist root.');
} else {
  console.log('⚠ Source directory not found, skipping postbuild copy.');
}

