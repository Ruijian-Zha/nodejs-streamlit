/**
 * This file sets up a server that can open URLs in a browser using a Chrome WebDriver.
 */

const express = require('express');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const FormData = require('form-data');
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();
const fs = require('fs'); // For createReadStream
const fsp = fs.promises; // For promise-based operations

const app = express();
const port = 3000;

// Global variable to keep track of the browser instance
let driver;

async function openUrlInChrome(url) {
  const driver = await getDriver();
  await driver.get(url);
  return driver;
}

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
// https://glider-summary-urgently.ngrok-free.app
app.get('/open-url', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('No URL provided.');
  }

  try {
    const driver = await openUrlInChrome(url);
    
    // Take a screenshot
    async function takeScreenshot(driver) {
  const screenshot = await driver.takeScreenshot();
  const imagePath = `screenshot.png`;
  await fsp.writeFile(imagePath, screenshot, 'base64');
  return screenshot;
}

    // Prepare form data for POST request
    const screenshot = await takeScreenshot(driver);

async function prepareFormData(screenshot) {
  const formData = new FormData();
  formData.append('image', screenshot, { filename: 'screenshot.png', contentType: 'image/png' });
  return formData;
}

    // Send the screenshot to the Flask server
    const formData = await prepareFormData(screenshot);

async function sendScreenshotToFlaskServer(formData) {
  const flaskServerUrl = 'https://glider-summary-urgently.ngrok-free.app/upload'; // Flask server URL
  const response = await fetch(flaskServerUrl, {
    method: 'POST',
    body: formData
  });
  return response;
}

const response = await sendScreenshotToFlaskServer(formData);
    const jsonResponse = await response.json();

    // Clean up the image file after sending
    async function cleanupImageFile(imagePath) {
  await fsp.unlink(imagePath);
}

await cleanupImageFile(imagePath);

    if (response.ok) {
      res.send(`URL is opened in Chrome and screenshot uploaded: ${jsonResponse.url}`);
    } else {
      res.status(500).send(`An error occurred while uploading the screenshot: ${jsonResponse.error}`);
    }
  } catch (error) {
    console.error(error);
    if (driver) {
      await driver.quit();
      driver = null;
    }
    res.status(500).send('An error occurred while opening the URL or taking a screenshot.');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});