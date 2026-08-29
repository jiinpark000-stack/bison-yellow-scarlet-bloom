import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const jobs = [
  { file: "og-card.html", out: join(here, "og-raw.png"), w: 1200, h: 630 },
  { file: "x-banner.html", out: join(here, "banner-raw.png"), w: 1200, h: 264 },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  for (const job of jobs) {
    const page = await browser.newPage({
      viewport: { width: job.w, height: job.h },
      deviceScaleFactor: 1,
    });
    const url = pathToFileURL(join(here, job.file)).href;
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: job.out, type: "png" });
    await page.close();
    console.log("wrote", job.out);
  }
} finally {
  await browser.close();
}
