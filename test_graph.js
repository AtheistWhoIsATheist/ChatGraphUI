import { chromium } from 'playwright';

(async () => {
  console.log('Starting Playwright test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Page loaded successfully');

    // Click Ontology Map tab
    const ontologyMapBtn = page.locator('button').filter({ hasText: 'Ontology Map' });
    await ontologyMapBtn.click();
    console.log('Clicked Ontology Map tab');

    // Look for graph container
    const graphContainer = page.locator('#interactive-ontology-graph-container');
    await graphContainer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Graph container is visible');

    // Check SVG text labels inside graph
    const labels = page.locator('#svg-network-canvas text.label');
    const labelCount = await labels.count();
    console.log(`Found ${labelCount} graph text labels rendered in 2D plane.`);

    if (labelCount > 0) {
      const firstLabelText = await labels.first().textContent();
      console.log('First graph label text:', firstLabelText);
    }

    // Check 3D toggle button
    const toggle3D = page.locator('#interactive-ontology-graph-container button').filter({ hasText: '3D' });
    if (await toggle3D.count() > 0) {
      await toggle3D.click();
      await page.waitForTimeout(1000);
      console.log('Switched to 3D Cosmos view');

      const labels3D = page.locator('div[class*="3d-label"]');
      console.log('3D overlay labels count:', await labels3D.count());
    }

    // Take screenshot
    await page.screenshot({ path: 'graph_test_screenshot.png', fullPage: false });
    console.log('Screenshot saved to graph_test_screenshot.png');

    console.log('Playwright test completed successfully!');

  } catch (err) {
    console.error('Playwright test error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
