const https = require('https');
const fs = require('fs');
const path = require('path');

const zodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Secrets から読み込み
const API_KEY = process.env.API_NINJAS_KEY;

function fetchHoroscope(sign) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.api-ninjas.com',
      path: `/v1/horoscope?zodiac=${sign}`,
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${sign}: ${data}`));
        }
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse JSON for ${sign}: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.end();
  });
}

async function fetchAllHoroscopes() {
  console.log('Fetching horoscope data for all zodiac signs...');
  const horoscopes = {};
  const errors = [];

  for (const sign of zodiacSigns) {
    try {
      console.log(`Fetching ${sign}...`);
      const data = await fetchHoroscope(sign);
      horoscopes[sign] = data;
      console.log(`✓ ${sign} - Success`);
      await new Promise(resolve => setTimeout(resolve, 800)); // rate limit対策
    } catch (error) {
      console.error(`✗ ${sign} - Failed: ${error.message}`);
      errors.push({ sign, error: error.message });
    }
  }

  const outputData = {
    updated_at: new Date().toISOString(),
    timezone: 'Asia/Tokyo',
    horoscopes,
    errors: errors.length > 0 ? errors : undefined
  };

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const outputPath = path.join(dataDir, 'horoscope.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

  console.log('\n=== Summary ===');
  console.log(`✓ Successfully fetched: ${Object.keys(horoscopes).length}/${zodiacSigns.length} signs`);
  if (errors.length > 0) console.log(`✗ Failed: ${errors.length} signs`);
  console.log(`Data saved to: ${outputPath}`);
}

fetchAllHoroscopes()
  .then(() => {
    console.log('\n✓ Horoscope data update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  });
