/**
 * This file sets up a server that can open URLs in a browser using a Chrome WebDriver.
 * It contains the getDriver() function which is responsible for creating and returning a Chrome WebDriver instance.
 * The server is used in conjunction with the Streamlit UI to provide a seamless user experience.
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

/**
 * This function creates a new Chrome WebDriver instance if one does not already exist.
 * It then returns the WebDriver instance.
 * 
 * @return {WebDriver} The Chrome WebDriver instance.
 */
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
    const driver = await getDriver();
    await driver.get(url);
    
    // Take a screenshot
    const screenshot = await driver.takeScreenshot();
    const screenshotBuffer = Buffer.from(screenshot, 'base64');
    
    // Prepare form data for POST request
    const formData = new FormData();
    formData.append('image', screenshotBuffer, { filename: 'screenshot.png', contentType: 'image/png' });
    
    // Send the screenshot to the Flask server
    const flaskServerUrl = 'https://glider-summary-urgently.ngrok-free.app/upload'; // Flask server URL
    const response = await fetch(flaskServerUrl, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders() // This is necessary for multipart/form-data
    });
    const jsonResponse = await response.json();

    // Clean up the image file after sending
    await fsp.unlink(imagePath);

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