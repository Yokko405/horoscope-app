const https = require('https');
const fs = require('fs');
const path = require('path');

const zodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const API_KEY = process.env.API_NINJAS_KEY;

// ✅ JSTの日付を取得して "YYYY-MM-DD" 形式に
function getJstDate() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split('T')[0];
}

function fetchHoroscope(sign) {
  const todayJst = getJstDate();
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.api-ninjas.com',
      path: `/v1/horoscope?zodiac=${sign}&date=${todayJst}`, // ✅ JST日付を明示
      method: 'GET',
      headers: { 'X-Api-Key': API_KEY }
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
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error(`✗ ${sign} - Failed: ${error.message}`);
      errors.push({ sign, error: error.message });
    }
  }

  const outputData = {
    updated_at: new Date().toISOString(),
    jst_date: getJstDate(), // ✅ JSTの日付も保存
    timezone: 'Asia/Tokyo',
    horoscopes,
    errors: errors.length > 0 ? errors : undefined
  };

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const outputPath = path.join(dataDir, 'horoscope.json');
  fs.writeFileSync(outputPath, Buffer.from(JSON.stringify(outputData, null, 2), 'utf8'));

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
