const express = require('express');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const app = express();
const port = 3000;

// Global variable to keep track of the browser instance
let driver;

async function getDriver() {
  if (driver) {
    return driver;
  }
  driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .build();
  return driver;
}

app.get('/open-url', async (req, res) => {
  const url = req.query.url; // Get the URL from the query string
  if (!url) {
    return res.status(400).send('No URL provided.');
  }

  try {
    const driver = await getDriver();
    await driver.get(url);
    res.send(`URL is opened in Chrome: ${url}`);
  } catch (error) {
    console.error(error);
    if (driver) {
      await driver.quit();
      driver = null; // Reset the driver after quitting
    }
    res.status(500).send('An error occurred while opening the URL.');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});