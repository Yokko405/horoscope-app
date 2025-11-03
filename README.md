# 🌟 Cosmic Fortune - 星占いアプリ

GitHub Actions + **API Ninjas Horoscope API** で動作する、完全自動更新の星占いアプリです。

## ✨ 特徴

- 🤖 **完全自動更新**: GitHub Actionsが毎日自動でAPIデータを取得
- 🚀 **CORS問題なし**: JSONファイル経由でブラウザに安全に配信
- 💎 **信頼性の高いAPI**: API Ninjasから取得した正確な占いデータ
- 🎨 **美しいUI**: 神秘的でモダンなデザイン
- 📱 **レスポンシブ対応**: PC/スマホどちらでも快適

## 🎯 システム構成

GitHub Actions (毎日自動実行)
↓
API Ninjas Horoscope API から 12星座分のデータ取得
↓
data/horoscope.json に保存
↓
GitHubに自動コミット
↓
GitHub Pages で公開
↓
ユーザーがアクセス (CORS問題なし!)


## ⚙️ 環境変数設定

`fetch-horoscope.js` では **API Ninjas** のキーが必要です。  
以下の手順でSecretsを登録してください。

1. GitHubリポジトリ → 「Settings」→「Secrets and variables」→「Actions」
2. 「New repository secret」をクリック
3. 名前：`API_NINJAS_KEY`
4. 値：API Ninjasで取得したAPIキー

これで安全に自動取得ができます。

## 🧠 fetch-horoscope.js 例

```js
import fetch from "node-fetch";
import fs from "fs";

const SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const API_KEY = process.env.API_NINJAS_KEY;
const headers = { "X-Api-Key": API_KEY };

async function getHoroscope(sign) {
  const res = await fetch(`https://api.api-ninjas.com/v1/horoscope?sign=${sign}`, { headers });
  return res.json();
}

const horoscopes = {};

for (const sign of SIGNS) {
  horoscopes[sign] = await getHoroscope(sign);
  await new Promise(r => setTimeout(r, 500)); // レート制限対策
}

fs.writeFileSync("data/horoscope.json", JSON.stringify({
  updated_at: new Date().toISOString(),
  horoscopes
}, null, 2));

**Push Your Limits!** 🔥
