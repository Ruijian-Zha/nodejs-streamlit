const express = require('express');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const app = express();
const port = 3000;

app.get('/open-shopify', async (req, res) => {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .build();

  try {
    await driver.get('http://www.shopify.com');
    res.send('Shopify is opened in Chrome!');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while opening Shopify.');
    await driver.quit(); // Move driver.quit() here to close the browser on error
  }
  // Removed the finally block to keep the browser open
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});