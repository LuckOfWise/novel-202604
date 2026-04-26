#!/usr/bin/env node
// カクヨム投稿スクリプト（Playwright直接利用版）
// 使い方: node scripts/post_episode.mjs <話数> [--publish]

import pkg from "/Users/luckofwise/ghq/github.com/SonicGarden/browsctl/node_modules/playwright/index.js";
const { chromium } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORK_ID = "2912051595978646813";
const BASE_URL = `https://kakuyomu.jp/my/works/${WORK_ID}`;
const CHAPTERS_DIR = path.join(__dirname, "..", "chapters");

const args = process.argv.slice(2);
const episodeNum = parseInt(args[0]);
const publish = args.includes("--publish");

if (!episodeNum) {
  console.error("使い方: node scripts/post_episode.mjs <話数> [--publish]");
  process.exit(1);
}

const padded = String(episodeNum).padStart(2, "0");
const file = path.join(CHAPTERS_DIR, `${padded}.md`);

if (!fs.existsSync(file)) {
  console.error(`❌ ファイルが見つかりません: ${file}`);
  process.exit(1);
}

const content = fs.readFileSync(file, "utf-8");
const lines = content.split("\n");
const title = lines[0].replace(/^# /, "");
// 5行目以降（0-indexed: line 4）を本文として使用、---は空行に
const body = lines.slice(4).map(l => l === "---" ? "" : l).join("\n").trim();

console.log(`📝 ${title} を投稿中...`);

const browser = await chromium.connectOverCDP("http://localhost:9222");
const context = browser.contexts()[0];
const pages = context.pages();
const page = pages[pages.length - 1];

try {
  // 新規エピソード作成ページへ移動（domcontentloadedで待機）
  console.log("🌐 新規エピソード作成ページへ移動...");
  await page.goto(`${BASE_URL}/episodes/new`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);

  // タイトル入力
  console.log("✏️ タイトル入力...");
  const titleInput = page.locator("#episodeTitle-input");
  await titleInput.waitFor({ timeout: 10000 });
  await titleInput.click();
  await page.keyboard.press("Meta+a");
  await titleInput.fill(title);
  await page.waitForTimeout(500);

  // 本文入力
  console.log("✏️ 本文入力...");
  const bodyInput = page.locator("textarea[name='body']");
  await bodyInput.waitFor({ timeout: 10000 });
  await bodyInput.fill(body);
  await page.waitForTimeout(1000);

  // 保存
  console.log("💾 保存中...");
  const saveBtn = page.getByText("保存", { exact: false }).first();
  await saveBtn.click();
  await page.waitForTimeout(3000);

  if (publish) {
    // 公開
    console.log("📣 公開手続き...");
    const publishBtn = page.getByText("公開に進む", { exact: false }).first();
    await publishBtn.click();
    await page.waitForTimeout(2000);

    const nowPublishBtn = page.getByText("今すぐ公開", { exact: false }).first();
    await nowPublishBtn.click();
    await page.waitForTimeout(3000);

    console.log(`✅ ${title} を公開しました`);
  } else {
    console.log(`💾 ${title} を下書き保存しました`);
  }
} catch (e) {
  console.error(`❌ エラー: ${e.message}`);
  await browser.close();
  process.exit(1);
}

await browser.close();
console.log("\n🎉 完了！");
