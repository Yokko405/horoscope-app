# 🌟 Cosmic Fortune - 星占いアプリ

GitHub Actions + Aztro API で動作する、完全自動更新の星占いアプリです。

## ✨ 特徴

- 🤖 **完全自動更新**: GitHub Actionsが毎日自動でAPIデータを取得
- 🚀 **CORS問題なし**: データはJSONファイル経由で提供
- 💎 **本物のAPIデータ**: Aztro APIから取得した正確な占い
- 🎨 **美しいUI**: 神秘的でモダンなデザイン
- 📱 **レスポンシブ対応**: PC/スマホどちらでも快適

## 🎯 システム構成

```
GitHub Actions (毎日自動実行)
    ↓
Aztro APIから12星座分のデータ取得
    ↓
data/horoscope.json に保存
    ↓
GitHubに自動コミット
    ↓
GitHub Pages で公開
    ↓
ユーザーがアクセス (CORS問題なし!)
```

## 📦 セットアップ手順

### 1. GitHubリポジトリを作成

```bash
# GitHubで新しいリポジトリを作成 (例: horoscope-app)
# 作成後、以下のコマンドでプッシュ

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/horoscope-app.git
git push -u origin main
```

### 2. GitHub Pagesを有効化

1. リポジトリの「Settings」タブを開く
2. 左メニューから「Pages」を選択
3. 「Source」で「Deploy from a branch」を選択
4. 「Branch」で「main」と「/ (root)」を選択
5. 「Save」をクリック

数分後、`https://YOUR_USERNAME.github.io/horoscope-app/` でアクセス可能になります。

### 3. GitHub Actionsの権限設定

1. リポジトリの「Settings」タブを開く
2. 左メニューから「Actions」→「General」を選択
3. 「Workflow permissions」で「Read and write permissions」を選択
4. 「Save」をクリック

### 4. 初回データ取得（手動実行）

1. リポジトリの「Actions」タブを開く
2. 「Update Horoscope Data」ワークフローを選択
3. 「Run workflow」→「Run workflow」をクリック

これで初回のデータが取得され、以降は毎日自動更新されます！

## 📂 ファイル構成

```
horoscope-app/
├── .github/
│   └── workflows/
│       └── update-horoscope.yml    # GitHub Actionsワークフロー
├── data/
│   └── horoscope.json              # 運勢データ（自動生成）
├── fetch-horoscope.js              # データ取得スクリプト
├── index.html                      # メインアプリ
└── README.md                       # このファイル
```

## 🤖 自動更新の仕組み

### スケジュール
- **毎日 日本時間 6:00 AM** に自動実行
- cron: `0 21 * * *` (UTC 21:00 = JST 06:00)

### 実行内容
1. Node.js環境をセットアップ
2. `fetch-horoscope.js` を実行
3. 12星座分のデータをAztro APIから取得
4. `data/horoscope.json` に保存
5. GitHubに自動コミット&プッシュ

### 手動実行
「Actions」タブから「Run workflow」で手動実行も可能です。

## 🎨 カスタマイズ

### 更新時刻を変更

`.github/workflows/update-horoscope.yml` の cron を編集:

```yaml
schedule:
  - cron: '0 21 * * *'  # UTC時刻で指定
```

日本時間との変換: `JST = UTC + 9時間`

### デザインを変更

`index.html` のCSSセクションを編集してください。

## 🔧 トラブルシューティング

### データが更新されない

1. 「Actions」タブでワークフローが成功しているか確認
2. `data/horoscope.json` が存在するか確認
3. GitHub Actionsの権限設定を確認

### GitHub Pagesが表示されない

1. Settings → Pages で設定を確認
2. デプロイに数分かかる場合があります
3. ブラウザのキャッシュをクリア

### APIエラーが出る

- Aztro APIは無料で使えますが、稀にダウンすることがあります
- その場合は数時間後に再度手動実行してください

## 📊 データ形式

`data/horoscope.json` の構造:

```json
{
  "updated_at": "2025-11-03T06:00:00.000Z",
  "timezone": "Asia/Tokyo",
  "horoscopes": {
    "aries": {
      "current_date": "November 3, 2025",
      "description": "今日の運勢...",
      "compatibility": "Cancer",
      "mood": "Relaxed",
      "color": "Spring Green",
      "lucky_number": "64",
      "lucky_time": "7am",
      "date_range": "Mar 21 - Apr 20"
    },
    ...
  }
}
```

## 🚀 今後の拡張案

- [ ] 週間・月間運勢の追加
- [ ] 相性診断機能
- [ ] 通知機能
- [ ] 多言語対応
- [ ] データの履歴保存

## 📝 ライセンス

このプロジェクトはMITライセンスです。

## 🙏 クレジット

- **Aztro API**: https://aztro.sameerkumar.website/
- **GitHub Actions**: 自動化に感謝！

---

**作成者**: YOKO  
**Push Your Limits!** 🔥
