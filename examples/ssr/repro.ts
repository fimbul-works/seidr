import puppeteer from "puppeteer";
import { renderFullStructureTree } from "../../src/ssr/structure/structure-map.js";

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

  const tree = pageResults.rawData ? renderFullStructureTree(pageResults.rawData) : null;

  const results = {
    ...pageResults,
    rawData: pageResults.rawData,
    structureTree: tree,
  };

  console.log("Results:", JSON.stringify(results, null, 2));

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

  await browser.close();
}

runTest("http://localhost:4000").catch((err) => {
  console.error(err);
  process.exit(1);
});
