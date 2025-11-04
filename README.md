# ✨ Cosmic Fortune - 今日の運勢

![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)
![Workflow](https://img.shields.io/github/actions/workflow/status/yokko405/horoscope-app/update-horoscope.yml?label=Auto%20Update)

※このリポジトリは個人学習および実験目的で公開しています。再利用・再配布はご遠慮ください。

> 🌟 **毎日自動で更新される、12星座の英日バイリンガル運勢サイト**

---

## 🪐 概要

**Cosmic Fortune** は、  
GitHub Actions を使って毎日自動的に12星座の運勢を取得・翻訳し、  
GitHub Pages 上に公開するシンプルで美しい Horoscope Web アプリです。

英語版＋日本語版の両方をAPIから取得し、  
UI上で🌐ボタンにより切り替え可能です。

📍公開ページ  
👉 [https://yokko405.github.io/horoscope-app/](https://yokko405.github.io/horoscope-app/)

---

## ⚙️ 技術スタック

| 項目 | 使用技術 |
|------|-----------|
| 自動スケジューリング | **GitHub Actions** |
| 運勢取得API | **API Ninjas - Horoscope API** |
| 翻訳API | **Google Cloud Translation API** |
| フロントエンド | **HTML / CSS / JavaScript** |
| デプロイ | **GitHub Pages** |

---

## 🧩 ファイル構成

```plaintext
.
├── index.html                   # 表示UI（英語/日本語切替対応）
├── data/
│   └── horoscope.json            # 自動生成される運勢データ（英日併記）
├── fetch-horoscope.js           # Ninjas + Google Translate APIでデータ生成
└── .github/
    └── workflows/
        └── update-horoscope.yml # 毎日定刻に自動更新実行
🚀 自動更新フロー
毎日 GitHub Actions が起動

現地時間（JST）に合わせてスケジュール実行。

fetch-horoscope.js が走る

API Ninjas から運勢データ（英語）を取得。

Google Translate API で翻訳

horoscope_ja フィールドとして各星座に日本語を追加。

data/horoscope.json を更新 & commit

GitHub Pages に自動反映✨

🔑 Secrets（環境変数設定）
GitHub リポジトリの Settings → Secrets → Actions に以下を登録。

名前	内容
API_NINJAS_KEY	API NinjasのAPIキー
GOOGLE_API_KEY	Google Cloud Translation APIキー

💫 表示機能
🌟 12星座カードレイアウト

🔁 英語／日本語の切替ボタン

✨ 星空アニメーション背景

🕊️ レスポンシブ対応（スマホでも美しく）

🕒 最終更新日時の自動表示

🧠 ローカルで試す方法
bash
コードをコピーする
# 依存ライブラリをインストール（初回のみ）
npm install axios @google-cloud/translate

# 実行
node fetch-horoscope.js

# 成果物
data/horoscope.json が自動生成されます
その後 index.html をブラウザで開けば、
ローカルでも表示確認が可能です。

🪄 カスタマイズ例
運勢文を絵文字付きに整形する

ラッキーカラーやラッキータイムを追加

翻訳済みテキストをキャッシュしてAPIコスト削減

月次のランキング集計を追加して占い拡張

🏷️ クレジット
Powered by
API Ninjas, Google Cloud Translation, and GitHub Actions
Designed & Developed by YOKO

📅 Last updated: 2025-11-04
