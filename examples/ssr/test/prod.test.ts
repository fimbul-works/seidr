import { type ChildProcess, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";

function findChrome(): string {
  const envPaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  for (const p of envPaths) {
    if (p && fs.existsSync(p)) return p;
  }

  // Look in user puppeteer cache
  const puppeteerCache = path.join(os.homedir(), ".cache/puppeteer/chrome");
  if (fs.existsSync(puppeteerCache)) {
    const dirs = fs.readdirSync(puppeteerCache).sort().reverse();
    for (const d of dirs) {
      const bin = path.join(puppeteerCache, d, "chrome-linux64/chrome");
      if (fs.existsSync(bin)) return bin;
    }
  }

  throw new Error("Could not find a Chrome or Chromium executable on the system.");
}

async function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.unref();
    s.on("error", reject);
    s.listen(0, () => {
      const port = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(port));
    });
  });
}

async function runTest() {
  const chromePath = findChrome();
  console.log("Using Chrome executable:", chromePath);

  const port = await getAvailablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const ssrDir = path.resolve(import.meta.dirname, "..");

  console.log(`Starting production server on ${baseUrl}...`);
  const server: ChildProcess = spawn("pnpm", ["exec", "tsx", "src/server.ts"], {
    cwd: ssrDir,
    detached: true,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "production",
    },
    stdio: ["pipe", "pipe", "pipe"],
  });

  server.stdout?.on("data", (d) => console.log(`[SERVER] ${d.toString().trim()}`));
  server.stderr?.on("data", (d) => console.error(`[SERVER ERR] ${d.toString().trim()}`));

  // Wait for server to start
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Server startup timed out")), 10000);
    server.stdout?.on("data", (data) => {
      if (data.toString().includes("started at")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.on("error", reject);
  });

  try {
    // 1. Check public static assets
    console.log("Verifying public static assets...");
    const particlesRes = await fetch(`${baseUrl}/particles.js`);
    if (particlesRes.status !== 200) {
      throw new Error(`Failed to serve /particles.js: status ${particlesRes.status}`);
    }
    const logoRes = await fetch(`${baseUrl}/seidr-logo.svg`);
    if (logoRes.status !== 200) {
      throw new Error(`Failed to serve /seidr-logo.svg: status ${logoRes.status}`);
    }
    console.log("✓ Public static assets served correctly (/particles.js, /seidr-logo.svg)");

    // 2. Check raw SSR HTML output
    console.log("Verifying raw SSR HTML response...");
    const rawRes = await fetch(`${baseUrl}/`);
    if (rawRes.status !== 200) {
      throw new Error(`SSR home request failed with status ${rawRes.status}`);
    }
    const rawHtml = await rawRes.text();
    if (rawHtml.includes("<!--app-html-->")) {
      throw new Error("Raw HTML still contains unresolved <!--app-html-->");
    }
    if (!rawHtml.includes("__SEIDR_HYDRATION_DATA__")) {
      throw new Error("Raw HTML is missing __SEIDR_HYDRATION_DATA__");
    }
    if (!rawHtml.includes("/blog.js")) {
      throw new Error("Raw HTML does not reference compiled production /blog.js bundle");
    }
    if (!rawHtml.includes(".css")) {
      throw new Error("Raw HTML does not reference compiled CSS stylesheet");
    }
    if (!rawHtml.includes('class="post-title"')) {
      throw new Error("Raw HTML does not have SSR posts rendered");
    }
    console.log("✓ SSR raw HTML is correctly populated with markup and hydration state");

    // 3. Launch Puppeteer
    console.log("Launching Puppeteer browser...");
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    try {
      const page = await browser.newPage();

      const pageErrors: string[] = [];
      page.on("pageerror", (err) => {
        pageErrors.push((err as Error).message);
        console.error(`[BROWSER ERROR] ${(err as Error).message}`);
      });

      const hydrationWarnings: string[] = [];
      page.on("console", (msg) => {
        const text = msg.text();
        if (text.includes("[Hydration] Mismatch") || text.includes("Mismatched element found")) {
          hydrationWarnings.push(text);
          console.warn(`[HYDRATION MISMATCH] ${text}`);
        }
      });

      // 4. Initial page load & hydration
      console.log("Navigating to home page...");
      await page.goto(`${baseUrl}/`, { waitUntil: "load" });

      await page.waitForSelector(".post-card", { timeout: 5000 });
      const postCardCount = await page.$$eval(".post-card", (els) => els.length);
      if (postCardCount === 0) {
        throw new Error("No post cards rendered on home page.");
      }
      const heroTitle = await page.$eval(".hero-title", (el) => el.textContent?.trim());
      if (!heroTitle) {
        throw new Error("Hero title is missing or empty after hydration.");
      }
      console.log(`✓ Home page hydrated successfully (${postCardCount} posts, hero title: "${heroTitle}")`);

      // 5. Client-side routing to post page
      console.log("Testing client-side routing to post page...");
      const firstLink = await page.$(".post-card a.post-card-title-link");
      if (!firstLink) throw new Error("Could not find post title link");
      await firstLink.click();

      await page.waitForSelector(".article-title", { timeout: 5000 });
      const currentUrl = page.url();
      if (!currentUrl.includes("/post/")) {
        throw new Error(`Expected URL to contain /post/, got: ${currentUrl}`);
      }
      const articleTitle = await page.$eval(".article-title", (el) => el.textContent?.trim());
      console.log(`✓ Client-side navigation succeeded (navigated to: ${currentUrl}, title: "${articleTitle}")`);

      // 6. Router back navigation
      console.log("Testing router back navigation...");
      const backLink = await page.$("a.back-link");
      if (!backLink) throw new Error("Could not find back link");
      await backLink.click();

      await page.waitForSelector(".post-card", { timeout: 5000 });
      if (page.url() !== `${baseUrl}/`) {
        throw new Error(`Expected URL to be ${baseUrl}/ after back navigation, got ${page.url()}`);
      }
      console.log("✓ Router back navigation succeeded");

      // 7. Direct navigation to post page (SSR + hydration)
      console.log("Testing direct SSR navigation to post page...");
      await page.goto(`${baseUrl}/post/hydration`, { waitUntil: "load" });
      await page.waitForSelector(".article-title", { timeout: 5000 });
      const directTitle = await page.$eval(".article-title", (el) => el.textContent?.trim());
      if (directTitle !== "Hydration Magic") {
        throw new Error(`Expected article title "Hydration Magic", got "${directTitle}"`);
      }
      console.log("✓ Direct navigation to /post/hydration rendered and hydrated correctly");

      // 8. 404 Not Found handling
      console.log("Testing 404 page...");
      await page.goto(`${baseUrl}/does-not-exist`, { waitUntil: "load" });
      await page.waitForSelector(".not-found-card", { timeout: 5000 });
      console.log("✓ 404 page rendered correctly");

      // 9. Check for hydration mismatches or page errors
      if (hydrationWarnings.length > 0) {
        throw new Error(`Hydration mismatches detected: ${hydrationWarnings.join("; ")}`);
      }
      if (pageErrors.length > 0) {
        throw new Error(`Page errors detected: ${pageErrors.join("; ")}`);
      }

      console.log("\n=========================================");
      console.log("  ALL PRODUCTION SSR CHECKS PASSED!     ");
      console.log("=========================================\n");
    } finally {
      await browser.close();
    }
  } finally {
    if (server.pid) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {}
    }
    server.kill();
  }
}

runTest()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
