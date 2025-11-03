const https = require('https');
const fs = require('fs');
const path = require('path');

// 12星座のリスト
const zodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// Aztro APIからデータを取得
function fetchHoroscope(sign) {
    return new Promise((resolve, reject) => {
        const postData = '';
        
        const options = {
            hostname: 'aztro.sameerkumar.website',
            path: `/?sign=${sign}&day=today`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (error) {
                    reject(new Error(`Failed to parse JSON for ${sign}: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// 全星座のデータを取得
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
            
            // APIレート制限対策: 各リクエスト間に1秒待機
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`✗ ${sign} - Failed: ${error.message}`);
            errors.push({ sign, error: error.message });
        }
    }

    // 結果をJSONファイルに保存
    const outputData = {
        updated_at: new Date().toISOString(),
        timezone: 'Asia/Tokyo',
        horoscopes: horoscopes,
        errors: errors.length > 0 ? errors : undefined
    };

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'horoscope.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

    console.log('\n=== Summary ===');
    console.log(`✓ Successfully fetched: ${Object.keys(horoscopes).length}/${zodiacSigns.length} signs`);
    if (errors.length > 0) {
        console.log(`✗ Failed: ${errors.length} signs`);
    }
    console.log(`Data saved to: ${outputPath}`);

    return outputData;
}

// メイン実行
fetchAllHoroscopes()
    .then(() => {
        console.log('\n✓ Horoscope data update completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Fatal error:', error);
        process.exit(1);
    });
