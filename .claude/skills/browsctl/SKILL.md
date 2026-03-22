---
name: browsctl
description: ブラウザを操作してWebページの閲覧・データ取得を行うCLIツール。Chrome DevTools Protocolで接続し、スクリーンショット確認→操作→データ抽出のループで作業する。
---

# browsctl

Claude Codeがブラウザを操作するためのCLIツール。
**APIキー不要。Claude Code自身が画面を見て判断し、このCLIで操作を実行する。**

## 前提：Edgeの起動

操作を始める前に、リモートデバッグ付きでEdgeを起動する必要がある。

```bash
# Mac
open -a 'Microsoft Edge' --args --remote-debugging-port=9222 --user-data-dir=/tmp/edge-dev
```

起動後、そのEdgeで必要なサービス（freee・Google Drive等）に手動でログインしておく。

## コマンド一覧

### open - URLを開く
```bash
browsctl open --url <URL> [--output <path>]
```
指定URLを開き、スクリーンショットを保存する。

### screenshot - 現在の画面を撮る
```bash
browsctl screenshot [--output <path>]
```
現在表示中のページのスクリーンショットを保存する。

### action - ブラウザ操作を実行する
```bash
# クリック（テキストまたはCSSセレクタで指定）
browsctl action --type click --selector "ログイン"

# テキスト入力
browsctl action --type type --selector "input[name=email]" --text "user@example.com"

# スクロール
browsctl action --type scroll --direction down --amount 500

# キー入力
browsctl action --type key --key Enter

# 待機
browsctl action --type wait --ms 2000
```

### extract - ページのテキストを抽出
```bash
# ページ全体のテキストを抽出
browsctl extract --output outputs/data.txt

# 特定の要素のみ抽出
browsctl extract --selector "table.transactions" --output outputs/table.txt
```

## 操作フロー

1. `open` でURLを開き、スクリーンショットを取得
2. スクリーンショットを見て次のアクションを判断
3. `action` でクリック・入力などを実行
4. `screenshot` で画面を確認しながら2〜3を繰り返す
5. 目的のデータが表示されたら `extract` で保存
6. 保存したファイルを読み込んで回答する

## outputs/ディレクトリ

取得データとスクリーンショットはすべて `outputs/` に保存される。
