// Unified Vercel deployment script
import { execSync } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const VERCEL_ORG_ID = process.env.VERCEL_ORG_ID;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const FIREBASE_SERVICE_ACCOUNT_PATH = './config/shadow2-eb47f-firebase-adminsdk-fbsvc-a1edc984b1.json';

// Check if required environment variables are set
if (!VERCEL_ORG_ID || !VERCEL_PROJECT_ID) {
  console.error('Error: VERCEL_ORG_ID and VERCEL_PROJECT_ID must be set in your environment variables.');
  console.log('You can find these values in your Vercel dashboard or by running "vercel link".');
  process.exit(1);
}

// Check if FIREBASE_SERVICE_ACCOUNT_KEY is already set
// If not, try to load from file
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY && fs.existsSync(FIREBASE_SERVICE_ACCOUNT_PATH)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify(serviceAccount);
    console.log('Firebase service account loaded from file.');
  } catch (error) {
    console.warn('Warning: Could not load Firebase service account from file.', error.message);
  }
}

// Pre-deployment checks
function preDeploymentChecks() {
  console.log('Running pre-deployment checks...');
  
  // Check for required API keys
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'DEEPSEEK_API_KEY',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Warning: The following environment variables are missing: ${missingVars.join(', ')}`);
    console.log('You should set these in your Vercel project settings.');
  }
  
  // Check that package.json has the correct configuration
  if (!fs.existsSync('./package.json')) {
    console.error('Error: package.json not found. Please run this script from the project root.');
    process.exit(1);
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (!packageJson.scripts.build) {
      console.error('Error: No "build" script found in package.json.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error reading package.json:', error.message);
    process.exit(1);
  }
}

// Deploy to Vercel
function deploy() {
  console.log('Deploying to Vercel...');
  
  try {
    // Run Vercel CLI with the environment variables
    const deployCommand = `vercel --prod`;
    console.log(`Running: ${deployCommand}`);
    execSync(deployCommand, { stdio: 'inherit' });
    
    console.log('\n✅ Deployment successful!');
    console.log('Visit your Vercel dashboard to see the deployment status and logs.');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Main execution
console.log('🚀 Starting Vercel deployment process...');
preDeploymentChecks();
deploy(); 