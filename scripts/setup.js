import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔧 Setting up Shadow AI DeepSeek Streaming Environment...');

// Check if Python 3 is installed
const checkPython = spawn('python', ['--version']);

checkPython.stdout.on('data', (data) => {
  console.log(`✅ Python detected: ${data.toString().trim()}`);
});

checkPython.stderr.on('data', (data) => {
  console.error(`⚠️ Python error: ${data.toString().trim()}`);
  console.error('⚠️ Please install Python 3 to use the streaming feature.');
  process.exit(1);
});

checkPython.on('close', async (code) => {
  if (code !== 0) {
    console.error('⚠️ Python is not installed or not in PATH.');
    console.error('⚠️ Please install Python 3 to use the streaming feature.');
    process.exit(1);
  }
  
  // Ensure scripts directory exists
  try {
    await fs.mkdir(join(__dirname, 'scripts'), { recursive: true });
    console.log('✅ Scripts directory verified');
  } catch (err) {
    console.error(`⚠️ Error creating scripts directory: ${err.message}`);
  }
  
  // Install Node.js dependencies
  console.log('📦 Installing Node.js dependencies...');
  const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
  
  npmInstall.on('close', (code) => {
    if (code !== 0) {
      console.error('⚠️ Error installing Node.js dependencies');
      process.exit(1);
    }
    
    console.log('✅ Node.js dependencies installed successfully');
    console.log('\n🚀 Setup complete! You can now run the application:');
    console.log('\n   npm run dev:all\n');
    console.log('This will start both the Next.js app and the streaming server.');
  });
}); 