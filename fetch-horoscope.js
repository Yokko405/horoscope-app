const https = require('https');
const fs = require('fs');
const path = require('path');

const zodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

function fetchHoroscope(sign) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'aztro.sameerkumar.website',
      path: `/?sign=${sign}&day=today`,
      method: 'POST'
      // ← headersを削除するのがポイント
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse JSON for ${sign}: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => reject(error));

    // POSTに空データを送る（必須）
    req.write('');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
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
