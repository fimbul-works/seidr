import puppeteer from "puppeteer";

async function runTest(url) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  const consoleMessages = [];
  page.on("console", (msg) => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log("BROWSER CONSOLE:", text);
  });

  await page.evaluateOnNewDocument(() => {
    window.process = { env: { DEBUG_HYDRATION: "true" } };
  });

  await page.goto(url);

  // Wait a bit for hydration to settle
  await new Promise((r) => setTimeout(r, 2000));

  const results = await page.evaluate(() => {
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

    return {
      navbarCount: navbars.length,
      appContainerCount: appContainers.length,
      containersInfo,
      bodyHtml: document.body.innerHTML.substring(0, 500) + "...",
    };
  });

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
