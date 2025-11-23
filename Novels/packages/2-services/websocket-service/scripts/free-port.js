const { execSync } = require('child_process');
const port = process.argv[2] || '3007';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function freePort() {
  try {
    console.log(`Checking for processes using port ${port}...`);
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    
    if (result.trim()) {
      const lines = result.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const match = line.match(/\s+(\d+)\s*$/);
        if (match) {
          pids.add(match[1]);
        }
      });
      
      pids.forEach(pid => {
        try {
          console.log(`Killing process ${pid}...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`✓ Process ${pid} terminated`);
        } catch (error) {
          // Process might already be gone, ignore
        }
      });
      
      // Wait for port to be released
      await sleep(1000);
      
      // Verify port is free
      try {
        const check = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
        if (check.trim()) {
          console.log(`⚠ Warning: Port ${port} may still be in use`);
        } else {
          console.log(`✓ Port ${port} is now free`);
        }
      } catch (error) {
        console.log(`✓ Port ${port} is now free`);
      }
    } else {
      console.log(`✓ Port ${port} is already free`);
    }
  } catch (error) {
    // No processes found, port is free
    console.log(`✓ Port ${port} is free`);
  }
}

freePort();

