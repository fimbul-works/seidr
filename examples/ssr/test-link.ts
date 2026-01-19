import puppeteer from "puppeteer";

async function testLink() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  console.log("Navigating to http://localhost:4000...");
  await page.goto("http://localhost:4000", { waitUntil: "networkidle0" });

  // Monitor for reloads
  let reloads = 0;
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      reloads++;
    }
  });

  console.log('Clicking the "Second Post" link...');

  // Find the link for "Second Post"
  const link = await page.waitForSelector('a[href="/post/second-post"]');

  // Click it
  await link.click();

  // Wait a bit to see if it reloads or just updates
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Reloads counted:", reloads - 1); // Subtract 1 for the initial navigation

  if (reloads > 1) {
    console.log("FAIL: Page reloaded on link click!");
  } else {
    console.log("SUCCESS: Page did not reload (SPA routing worked or nothing happened).");
  }

  // Check if content updated
  const hasPostContent = await page.$eval("body", (el) => el.textContent.includes("Another nice post"));
  console.log("Contains second post content:", hasPostContent);

  await browser.close();
}

testLink().catch((err) => {
  console.error(err);
  process.exit(1);
});
