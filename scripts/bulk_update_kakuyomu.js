#!/usr/bin/env node
// カクヨム既存エピソード一括更新スクリプト
// 使い方: node scripts/bulk_update_kakuyomu.js

const { chromium } = require('/Users/luckofwise/ghq/github.com/SonicGarden/browsctl/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const WORK_ID = '2912051595978646813';
const CHAPTERS_DIR = path.join(__dirname, '..', 'chapters');

// 話数 → エピソードID マッピング
const EPISODE_IDS = [
  '2912051595979483814',  // 1話
  '2912051595979654343',  // 2話
  '2912051595979736349',  // 3話
  '2912051595979818410',  // 4話
  '2912051595979900168',  // 5話
  '2912051595979984130',  // 6話
  '2912051595980065929',  // 7話
  '2912051595980148420',  // 8話
  '2912051595980232393',  // 9話
  '2912051595980313718',  // 10話
  '2912051595997409936',  // 11話
  '2912051595997502672',  // 12話
  '2912051595997640077',  // 13話
  '2912051595997762529',  // 14話
  '2912051595997855129',  // 15話
  '2912051595997960768',  // 16話
  '2912051595998056258',  // 17話
  '2912051595998249096',  // 18話
  '2912051595998339275',  // 19話
  '2912051595998433492',  // 20話
  '2912051595998525792',  // 21話
  '2912051595998617806',  // 22話
  '2912051595998708920',  // 23話
  '2912051595998800062',  // 24話
  '2912051595998892638',  // 25話
  '2912051595998984500',  // 26話
  '2912051595999079514',  // 27話
  '2912051595999169003',  // 28話
  '2912051595999257017',  // 29話
  '2912051595999349788',  // 30話
  '2912051596055129654',  // 31話
  '2912051596139293821',  // 32話
];

function readChapter(num) {
  const file = path.join(CHAPTERS_DIR, String(num).padStart(2, '0') + '.md');
  if (!fs.existsSync(file)) return null;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const title = lines[0].replace(/^# /, '');
  // 5行目以降が本文、---は空行に
  const body = lines.slice(4).join('\n').replace(/^---$/gm, '');
  return { title, body };
}

async function updateEpisode(page, num, episodeId) {
  const chapter = readChapter(num);
  if (!chapter) {
    console.log(`⚠️  第${num}話のファイルが見つかりません`);
    return;
  }

  const url = `https://kakuyomu.jp/my/works/${WORK_ID}/episodes/${episodeId}`;
  console.log(`✏️  第${num}話「${chapter.title}」を更新中...`);

  await page.goto(url);
  await page.waitForTimeout(2000);

  // タイトル更新
  const titleInput = page.locator('#episodeTitle-input');
  await titleInput.click();
  await titleInput.selectAll ? titleInput.selectAll() : page.keyboard.press('Meta+a');
  await page.waitForTimeout(200);
  await titleInput.fill(chapter.title);
  await page.waitForTimeout(300);

  // 本文更新
  const bodyInput = page.locator('#episodeBody-input');
  await bodyInput.click();
  await page.keyboard.press('Meta+a');
  await page.waitForTimeout(300);
  await bodyInput.fill(chapter.body);
  await page.waitForTimeout(500);

  // 更新ボタンをクリック
  await page.getByText('更新', { exact: true }).click();
  await page.waitForTimeout(2000);

  console.log(`✅ 第${num}話を更新しました`);
}

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[context.pages().length - 1];

  const startNum = parseInt(process.argv[2]) || 1;
  const endNum = parseInt(process.argv[3]) || 32;

  console.log(`\n📚 第${startNum}〜${endNum}話を更新します\n`);

  for (let i = startNum; i <= endNum; i++) {
    const episodeId = EPISODE_IDS[i - 1];
    if (!episodeId) {
      console.log(`⚠️  第${i}話のエピソードIDが見つかりません`);
      continue;
    }
    try {
      await updateEpisode(page, i, episodeId);
    } catch (err) {
      console.error(`❌ 第${i}話の更新に失敗: ${err.message}`);
    }
    await page.waitForTimeout(1000);
  }

  console.log('\n🎉 完了！');
  await browser.close();
})();
