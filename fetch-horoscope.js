// === Cosmic Fortune Horoscope Fetcher ===
// API-Ninjas から 12 星座の運勢を取得して JSON 出力 (BOMなし)

const https = require('https');
const fs = require('fs');
const path = require('path');

const zodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Secrets から APIキーを取得
const API_KEY = process.env.API_NINJAS_KEY;

function fetchHoroscope(sign) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.api-ninjas.com',
      path: `/v1/horoscope?zodiac=${sign}`,
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
        } catch (err) {
          reject(new Error(`Failed to parse JSON for ${sign}: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchAllHoroscopes() {
  console.log('=== Fetching Horoscope Data ===');
  const horoscopes = {};
  const errors = [];

  for (const sign of zodiacSigns) {
    try {
      console.log(`🔮 Fetching ${sign}...`);
      const data = await fetchHoroscope(sign);
      horoscopes[sign] = data;
      console.log(`✅ ${sign} - OK`);
      await new Promise(r => setTimeout(r, 800)); // rate limit対策
    } catch (e) {
      console.error(`❌ ${sign} - ${e.message}`);
      errors.push({ sign, error: e.message });
    }
  }

  // JSTの日時
  const now = new Date();
  const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const jstDate = jst.toISOString().split('T')[0];

  const outputData = {
    updated_at: now.toISOString(),
    jst_date: jstDate,
    timezone: 'Asia/Tokyo',
    horoscopes,
    errors: errors.length > 0 ? errors : undefined
  };

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const outputPath = path.join(dataDir, 'horoscope.json');

  // ✅ BOMなしで書き出し
  fs.writeFileSync(outputPath, Buffer.from(JSON.stringify(outputData, null, 2), 'utf8'));
  console.log(`\n✨ Saved to: ${outputPath}`);
  console.log(`✅ Done (${Object.keys(horoscopes).length} signs)`);
}

fetchAllHoroscopes()
  .then(() => {
    console.log('\n🌙 Horoscope update completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('\n💀 Fatal error:', e);
    process.exit(1);
  });
