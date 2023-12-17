/**
 * This file sets up a server that can open URLs in a browser using a Chrome WebDriver.
 */

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

/**
 * Handles the GET request to open a URL in Chrome.
 *
 * This function takes a URL from the query string of the GET request and uses the Chrome WebDriver to open the URL in Chrome.
 */
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