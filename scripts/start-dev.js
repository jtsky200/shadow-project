import { spawn } from 'child_process';

import { dirname, join } from 'path';

import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Start Next.js app
const nextApp = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

// Start streaming server
const server = spawn('node', [join(__dirname, 'server.js')], { stdio: 'inherit' });

// Log process started
console.log('🚀 Started Next.js app on http://localhost:3000');
console.log('🚀 Started streaming server on http://localhost:3001');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down services...');
  nextApp.kill();
  server.kill();
  process.exit(0);
});

// Handle child process exit
nextApp.on('close', (code) => {
  console.log(`Next.js app exited with code ${code}`);
  server.kill();
  process.exit(code);
});

server.on('close', (code) => {
  console.log(`Streaming server exited with code ${code}`);
  nextApp.kill();
  process.exit(code);
}); 