import puppeteer from "puppeteer";

async function inspect() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  console.log("Navigating to http://localhost:4000...");

  page.on("console", (msg) => {
    console.log("BROWSER CONSOLE:", msg.text());
  });

  page.on("request", (req) => {
    if (req.url().includes("/api/")) {
      console.log("NETWORK REQUEST:", req.url());
    }
  });

  // Disable JavaScript to see only SSR result
  await page.setJavaScriptEnabled(false);

  await page.goto("http://localhost:4000", { waitUntil: "networkidle0" });

  const html = await page.content();
  console.log("--- SSR HTML ---");
  console.log(html);
  console.log("----------------");

  // Re-enable JS to see if it hydrates (though user says it's broken)
  await page.setJavaScriptEnabled(true);
  await page.reload({ waitUntil: "networkidle0" });

  const hydratedHtml = await page.content();
  console.log("--- Hydrated HTML (Home) ---");
  console.log(hydratedHtml);
  console.log("----------------------");

  console.log("Navigating to http://localhost:4000/post/hello-world...");
  await page.setJavaScriptEnabled(false);
  await page.goto("http://localhost:4000/post/hello-world", { waitUntil: "networkidle0" });
  const postHtml = await page.content();
  console.log("--- SSR HTML (Post) ---");
  console.log(postHtml);
  console.log("----------------------");

  await page.setJavaScriptEnabled(true);
  await page.reload({ waitUntil: "networkidle0" });
  const hydratedPostHtml = await page.content();
  console.log("--- Hydrated HTML (Post) ---");
  console.log(hydratedPostHtml);
  console.log("----------------------");

  await browser.close();
}

inspect().catch((err) => {
  console.error(err);
  process.exit(1);
});
