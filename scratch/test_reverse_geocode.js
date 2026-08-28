async function testReverse(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'HeatShield-App/1.0',
        'Accept': 'application/json',
      }
    });
    if (res.ok) {
      const json = await res.json();
      console.log('Result for:', lat, lng);
      console.log('Display Name:', json.display_name);
      console.log('Class:', json.class);
      console.log('Type:', json.type);
      console.log('Address:', JSON.stringify(json.address, null, 2));
    } else {
      console.log('Error:', res.status);
    }
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  // Test a few coordinates (e.g. Phoenix downtown vs a park)
  await testReverse(33.4484, -112.0740); // downtown Phoenix
  await testReverse(33.435, -112.065); // residential/park area
}

run();
