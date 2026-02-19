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

// --- Google Translation API (httpsモジュール使用) ---
function translateText(text) {
  return new Promise((resolve, reject) => {
    if (!text) {
      resolve('');
      return;
    }

    const postData = JSON.stringify({
      q: text,
      target: 'ja',
      format: 'text',
    });

    const options = {
      hostname: 'translation.googleapis.com',
      path: `/language/translate/v2?key=${GOOGLE_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.warn(`⚠️ Translation API error: ${res.statusCode}`);
          resolve(text);
          return;
        }
        try {
          const json = JSON.parse(data);
          const translatedText = json.data?.translations?.[0]?.translatedText || text;
          resolve(translatedText);
        } catch (err) {
          console.error(`Translation parse error: ${err.message}`);
          resolve(text);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Translation error: ${error.message}`);
      resolve(text);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.error('Translation timeout');
      resolve(text);
    });

    req.write(postData);
    req.end();
  });
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
        date: jstDate, // 現在の日付（JST）を使用
        sign: data.sign,
        horoscope: englishText,
        horoscope_ja: japaneseText
      };
      
      console.log(`✅ ${sign} - OK`);
      await new Promise(r => setTimeout(r, 800));
    } catch (e) {
      console.error(`❌ ${sign} - ${e.message}`);
      errors.push({ sign, error: e.message });
    }
  }

  // 全星座失敗の場合は既存データを上書きしない
  const successCount = Object.keys(horoscopes).length;
  if (successCount === 0) {
    console.log('\n⚠️ 全星座のデータ取得に失敗 → 既存データを保持（上書きスキップ）');
    return;
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
  console.log(`✅ Done (${successCount}/12 signs)`);
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
