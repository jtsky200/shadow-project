// A simple script to test the Firebase configuration
async function testFirebaseConfig() {
  try {
    console.log('Testing Firebase configuration...');
    const response = await fetch('http://localhost:3000/api/firebase-test');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Firebase Test Results:', JSON.stringify(data, null, 2));
    
    if (data.clientSDK === 'Connected' && data.adminSDK === 'Connected') {
      console.log('✅ Firebase configuration successful!');
    } else {
      console.log('⚠️ Firebase configuration partially successful:');
      if (data.clientSDK !== 'Connected') console.log('  - Client SDK not connected');
      if (data.adminSDK !== 'Connected') console.log('  - Admin SDK not connected');
    }
  } catch (error) {
    console.error('❌ Error testing Firebase configuration:', error);
  }
}

// Wait for the server to start
setTimeout(() => {
  testFirebaseConfig();
}, 5000);

console.log('Waiting for server to start...'); 