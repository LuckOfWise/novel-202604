#!/bin/bash
# カクヨム既存エピソード更新スクリプト
# 使い方: ./scripts/update_kakuyomu.sh <話数> <エピソードID>
# 例: ./scripts/update_kakuyomu.sh 1 2912051595979483814

set -e

WORK_ID="2912051595978646813"
BASE_URL="https://kakuyomu.jp/my/works/${WORK_ID}"
CHAPTERS_DIR="$(cd "$(dirname "$0")/.." && pwd)/chapters"

NUM=$1
EPISODE_ID=$2

if [ -z "$NUM" ] || [ -z "$EPISODE_ID" ]; then
  echo "使い方: $0 <話数> <エピソードID>"
  exit 1
fi

FILE="${CHAPTERS_DIR}/$(printf '%02d' $NUM).md"
if [ ! -f "$FILE" ]; then
  echo "❌ ファイルが見つかりません: $FILE"
  exit 1
fi

TITLE=$(head -1 "$FILE" | sed 's/^# //')
BODY=$(sed -n '5,$p' "$FILE" | sed 's/^---$//')

echo "✏️  第${NUM}話「${TITLE}」を更新中..."

EDIT_URL="${BASE_URL}/episodes/${EPISODE_ID}"

browsctl open --url "$EDIT_URL" --output outputs/edit_${NUM}.png > /dev/null 2>&1
sleep 2

# タイトルをクリアして入力
browsctl action --type click --selector "#episodeTitle-input" > /dev/null 2>&1
sleep 0.2
browsctl action --type key --key "Meta+a" > /dev/null 2>&1
sleep 0.2
browsctl action --type type --selector "#episodeTitle-input" --text "$TITLE" > /dev/null 2>&1
sleep 0.3

# 本文をクリアして入力
browsctl action --type click --selector "textarea[name='body']" > /dev/null 2>&1
sleep 0.2
browsctl action --type key --key "Meta+a" > /dev/null 2>&1
sleep 0.3
browsctl action --type type --selector "textarea[name='body']" --text "$BODY" > /dev/null 2>&1
sleep 0.5

# 保存
browsctl action --type click --selector "保存" > /dev/null 2>&1
sleep 2

echo "✅ 第${NUM}話を更新しました"
