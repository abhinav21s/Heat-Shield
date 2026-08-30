const fs = require('fs');
const path = require('path');

// Locate .env in the project root
const envPath = path.join(__dirname, '../.env');
let tomtomKey = process.env.TOMTOM_API_KEY || process.env.NEXT_PUBLIC_TOMTOM_API_KEY || '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const keyMatch = envContent.match(/^TOMTOM_API_KEY=(.*)$/m) || envContent.match(/^NEXT_PUBLIC_TOMTOM_API_KEY=(.*)$/m);
  if (keyMatch && keyMatch[1]) {
    tomtomKey = keyMatch[1].trim();
  }
}

if (!tomtomKey) {
  console.error('Error: TOMTOM_API_KEY not found in .env');
  process.exit(1);
}

async function testPoi(lat, lng, query) {
  // TomTom Search API POI Search
  const url = `https://api.tomtom.com/search/2/poiSearch/${encodeURIComponent(query)}.json?key=${tomtomKey}&lat=${lat}&lon=${lng}&radius=8000&limit=5`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      console.log(`POI query: "${query}" near ${lat}, ${lng}:`);
      if (json.results) {
        json.results.forEach((item, idx) => {
          console.log(`  [${idx+1}] ${item.poi?.name} - ${item.address?.freeformAddress} (${item.dist} meters away)`);
          console.log(`      Coordinates: ${item.position.lat}, ${item.position.lon}`);
        });
      } else {
        console.log('No results found.');
      }
    } else {
      console.log('Error status:', res.status);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

async function run() {
  await testPoi(33.4484, -112.0740, "shopping mall, park, garden, library, community center");
}

run();
