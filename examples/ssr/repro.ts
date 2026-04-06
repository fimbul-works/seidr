import puppeteer from "puppeteer";
import { buildStructureMap } from "../../src/ssr/structure/index.js";

async function runTest(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  const consoleMessages: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log("BROWSER CONSOLE:", text);
  });

  await page.evaluateOnNewDocument(() => {
    (window as any).process = { env: { DEBUG_HYDRATION: "true" } };
  });

  await page.goto(url);

  // Wait a bit for hydration to settle
  await new Promise((r) => setTimeout(r, 2000));

  await page.evaluate(() => {
    const app = document.getElementById("app");
    console.log("CONTAINER HTML BEFORE HYDRATION:", app?.innerHTML);
  });

  const pageResults = await page.evaluate(() => {
    const navbars = document.querySelectorAll(".navbar");
    const appContainers = document.querySelectorAll(".app-container");
    const appDiv = document.getElementById("app");

    const containersInfo = Array.from(appContainers).map((c, i) => ({
      index: i,
      html: c.innerHTML.substring(0, 100) + "...",
      parent: c.parentElement ? c.parentElement.id || c.parentElement.tagName : "null",
      attributes: Array.from(c.attributes)
        .map((a) => `${a.name}="${a.value}"`)
        .join(" "),
    }));

    const rawData = (window as any).__SEIDR_HYDRATION_DATA__;

    return {
      navbarCount: navbars.length,
      appContainerCount: appContainers.length,
      containersInfo,
      rawData,
      bodyHtml: document.body.innerHTML.substring(0, 500) + "...",
    };
  });

  const tree = pageResults.rawData ? buildStructureMap(pageResults.rawData.components) : null;

  const results = {
    ...pageResults,
    rawData: pageResults.rawData,
    structureTree: tree,
  };

  console.log("Full Hydration Data:", JSON.stringify(results.rawData, null, 2));
  console.log("Results Summary:", JSON.stringify({ ...results, rawData: undefined }, null, 2));

  const mismatches = consoleMessages.filter((m) => m.includes("[Hydration]"));
  if (mismatches.length > 0) {
    console.log("Hydration Mismatches detected:", mismatches);
  } else {
    console.log("No hydration mismatches detected in console.");
  }

  if (results.appContainerCount > 1) {
    console.error("FAILURE: Duplication detected! Multiple .app-container elements found.");
  } else {
    console.log("SUCCESS: No duplication detected (at least for .app-container).");
  }

  // --- Start Navigation Test ---
  console.log("\n--- Testing Navigation ---");
  // Find a link to a post and click it
  const postLinkSelector = ".post-list a";
  await page.waitForSelector(postLinkSelector);

  const postTitleBefore = await page.evaluate((sel) => document.querySelector(sel)?.textContent, postLinkSelector);
  console.log(`Clicking link: ${postTitleBefore}`);

  await page.click(postLinkSelector);

  // Wait for the new content to appear (e.g. the post page h1)
  await page.waitForSelector(".post-page h1", { timeout: 5000 }).catch(() => {
    console.error("FAILURE: Timed out waiting for .post-page h1");
  });

  // Wait a bit for any dynamic content/mounting to settle
  await new Promise((r) => setTimeout(r, 1000));

  const navResults = await page.evaluate(() => {
    const postPages = document.querySelectorAll(".post-page");
    const homePages = document.querySelectorAll(".home-page");
    const appContainers = document.querySelectorAll(".app-container");

    return {
      postPageCount: postPages.length,
      homePageCount: homePages.length,
      appContainerCount: appContainers.length,
      postTitle: document.querySelector(".post-page h1")?.textContent,
      htmlSample: document.querySelector(".main-content")?.innerHTML.substring(0, 500) + "...",
    };
  });

  console.log("Navigation results:", JSON.stringify(navResults, null, 2));

  if (navResults.homePageCount > 0) {
    console.error("FAILURE: .home-page STILL PERSISTS after navigation! Unmount failed.");
  } else {
    console.log("SUCCESS: .home-page was correctly removed.");
  }

  if (navResults.postPageCount > 1) {
    console.error(`FAILURE: Found ${navResults.postPageCount} .post-page elements! Duplication on mount.`);
  } else if (navResults.postPageCount === 1) {
    console.log("SUCCESS: Single .post-page mounted correctly.");
  }
  // --- End Navigation Test ---

  await browser.close();
}

runTest("http://localhost:4000").catch((err) => {
  console.error(err);
  process.exit(1);
});
