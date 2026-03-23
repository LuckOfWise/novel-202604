#!/bin/bash
# カクヨム自動投稿スクリプト
# 使い方: ./scripts/post_kakuyomu.sh <話数> [--publish]
#   例: ./scripts/post_kakuyomu.sh 2 --publish   # 第2話を公開
#   例: ./scripts/post_kakuyomu.sh 3              # 第3話を下書き保存のみ
#   例: ./scripts/post_kakuyomu.sh 5-10 --publish # 第5話〜第10話を一括公開

set -e

WORK_ID="2912051595978646813"
BASE_URL="https://kakuyomu.jp/my/works/${WORK_ID}"
CHAPTERS_DIR="$(cd "$(dirname "$0")/.." && pwd)/chapters"
PUBLISH_FLAG="${2:-}"

# 引数チェック
if [ -z "$1" ]; then
  echo "使い方: $0 <話数> [--publish]"
  echo "  例: $0 2 --publish"
  echo "  例: $0 5-10 --publish"
  exit 1
fi

# 範囲指定のパース
if [[ "$1" == *-* ]]; then
  START=$(echo "$1" | cut -d'-' -f1)
  END=$(echo "$1" | cut -d'-' -f2)
else
  START="$1"
  END="$1"
fi

post_chapter() {
  local NUM=$1
  local FILE="${CHAPTERS_DIR}/$(printf '%02d' $NUM).md"

  if [ ! -f "$FILE" ]; then
    echo "❌ ファイルが見つかりません: $FILE"
    return 1
  fi

  # タイトルを抽出（# 第X話「...」から）
  local TITLE=$(head -1 "$FILE" | sed 's/^# //')

  # 本文を抽出（タイトル行と最初の---を除く、残りの---は空行に）
  local BODY=$(sed -n '5,$p' "$FILE" | sed 's/^---$//')

  echo "📝 ${TITLE} を投稿中..."

  # 新規エピソード作成ページを開く
  browsctl open --url "${BASE_URL}/episodes/new" --output outputs/post_${NUM}.png > /dev/null 2>&1
  sleep 2

  # タイトル入力
  browsctl action --type click --selector "#episodeTitle-input" > /dev/null 2>&1
  sleep 0.2
  browsctl action --type key --key "Meta+a" > /dev/null 2>&1
  sleep 0.2
  browsctl action --type type --selector "#episodeTitle-input" --text "$TITLE" > /dev/null 2>&1
  sleep 0.3

  # 本文入力
  browsctl action --type type --selector "textarea[name='body']" --text "$BODY" > /dev/null 2>&1
  sleep 0.5

  # 保存
  browsctl action --type click --selector "保存" > /dev/null 2>&1
  sleep 2

  if [ "$PUBLISH_FLAG" = "--publish" ]; then
    # 公開
    browsctl action --type click --selector "公開に進む" > /dev/null 2>&1
    sleep 2
    browsctl action --type click --selector "今すぐ公開" > /dev/null 2>&1
    sleep 3
    echo "✅ ${TITLE} を公開しました"
  else
    echo "💾 ${TITLE} を下書き保存しました"
  fi
}

# 投稿実行
for NUM in $(seq $START $END); do
  post_chapter $NUM
  if [ $NUM -lt $END ]; then
    sleep 2  # 連続投稿の間隔
  fi
done

echo ""
echo "🎉 完了！"
