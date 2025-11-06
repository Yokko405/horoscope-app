// === Cosmic Fortune Horoscope Fetcher (Production Ready) ===
const https = require('https');
const fs = require('fs');
const path = require('path');

// 🔐 環境変数チェック
const NINJA_KEY = process.env.API_NINJAS_KEY;
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

if (!NINJA_KEY || !GOOGLE_KEY) {
  console.error('❌ Error: API keys not found in environment variables');
  console.error('Required: API_NINJAS_KEY, GOOGLE_API_KEY');
  process.exit(1);
}

// 🌏 JST日付の取得
const now = new Date();
const jstOffset = 9 * 60 * 60 * 1000;
const jstDate = new Date(now.getTime() + jstOffset)
  .toISOString()
  .split('T')[0];

const zodiacSigns = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// --- Google Translation API ---
async function translateText(text) {
  if (!text) return '';
  
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target: "ja",
        format: "text",
      })
    });

    if (!response.ok) {
      console.warn(`⚠️ Translation API error: ${response.status}`);
      return text;
    }

    const data = await response.json();
    return data.data?.translations?.[0]?.translatedText || text;
  } catch (error) {
    console.error(`Translation error: ${error.message}`);
    return text;
  }
}

function fetchHoroscope(sign) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.api-ninjas.com',
      path: `/v1/horoscope?zodiac=${sign}`,
      method: 'GET',
      headers: { 'X-Api-Key': NINJA_KEY }
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
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error(`Timeout for ${sign}`));
    });
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
      
      // 翻訳
      const englishText = data.horoscope || '';
      const japaneseText = await translateText(englishText);

      horoscopes[sign] = {
        date: data.date,
        sign: data.sign,
        horoscope: englishText,
        horoscope_ja: japaneseText
      };
      
      console.log(`✅ ${sign} - OK`);
      await new Promise(r => setTimeout(r, 800)); // Rate limit対策
    } catch (e) {
      console.error(`❌ ${sign} - ${e.message}`);
      errors.push({ sign, error: e.message });
    }
  }

  const outputData = {
    updated_at: now.toISOString(),
    jst_date: jstDate,
    timezone: 'Asia/Tokyo',
    horoscopes,
    ...(errors.length > 0 && { errors })
  };

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, 'horoscope.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

  console.log(`\n✨ Saved to: ${outputPath}`);
  console.log(`✅ Done (${Object.keys(horoscopes).length}/12 signs)`);
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
