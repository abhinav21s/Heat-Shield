const fs = require('fs');
const path = require('path');

// Locate .env in the project root
const envPath = path.join(__dirname, '../.env');
let apiKey = process.env.FORTYGUARD_API_KEY || '';
let apiURL = process.env.FORTYGUARD_API_URL || 'https://api.fortyguard.com';

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

if (!apiKey) {
  console.error('Error: FORTYGUARD_API_KEY not found in .env');
  process.exit(1);
}

console.log('API URL:', apiURL);

async function run() {
  const lat = 33.4484;
  const lng = -112.0740;

  const now = new Date();
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const start_date = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
  const start_time = `${pad(now.getUTCHours())}:00`;

  const body = {
    lat,
    lng,
    latitude: lat,
    longitude: lng,
    point: [lng, lat],
    temperature: 30, // in C
    date_time: {
      filter_type: 1,
      start_date,
      start_time,
    }
  };

  try {
    const postResponse = await fetch(`${apiURL}/v1/env_params`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body)
    });

    console.log('POST Status:', postResponse.status);
    const postJson = await postResponse.json();
    console.log('POST Response:', JSON.stringify(postJson));

    const activityId = postJson.data?.activity_id;
    if (!activityId) {
      console.error('No activity_id returned!');
      return;
    }

    console.log(`Polling status for activity_id: ${activityId}...`);
    let completed = false;
    let attempts = 0;

    while (!completed && attempts < 15) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`${apiURL}/v1/status/${activityId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'api-key': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        }
      });

      console.log(`Attempt ${attempts}: GET status code:`, statusResponse.status);
      const statusJson = await statusResponse.json();
      console.log(`Attempt ${attempts} body:`, JSON.stringify(statusJson));

      if (statusJson.data && statusJson.data.status === 'Completed') {
        completed = true;
        console.log('SUCCESS! Completed result data:', JSON.stringify(statusJson.data.result, null, 2));
      } else if (statusJson.data && statusJson.data.status === 'Failed') {
        completed = true;
        console.log('FAILED! Activity failed.');
      }
    }
  } catch (error) {
    console.error('Error in FortyGuard API flow:', error);
  }
}

run();
