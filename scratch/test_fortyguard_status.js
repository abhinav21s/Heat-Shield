const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../../../../../Desktop/Heat-Shield/.env');
let apiKey = '991763dc1946837b058d839ad3f312ac';
let apiURL = 'https://api.fortyguard.com';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const keyMatch = envContent.match(/^FORTYGUARD_API_KEY=(.*)$/m);
  if (keyMatch && keyMatch[1]) {
    apiKey = keyMatch[1].trim();
  }
  const urlMatch = envContent.match(/^FORTYGUARD_API_URL=(.*)$/m);
  if (urlMatch && urlMatch[1]) {
    apiURL = urlMatch[1].trim();
  }
}

const activityId = 'f42f1d4f-b5da-4750-ade0-7ec2d748c465';

async function checkStatus() {
  try {
    const response = await fetch(`${apiURL}/v1/status/${activityId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    console.log('Status Code:', response.status);
    const json = await response.json();
    console.log('Response JSON:', JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatus();
