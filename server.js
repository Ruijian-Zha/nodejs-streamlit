/**
 * This file sets up a server that can open URLs in a browser using a Chrome WebDriver.
 * It contains the getDriver() function which is responsible for creating and returning a Chrome WebDriver instance.
 * The server is used in conjunction with the Streamlit UI to provide a seamless user experience.
 */
const { createCanvas, loadImage, registerFont } = require('canvas');
const randomColor = require('randomcolor'); 
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

    // Execute JavaScript code in the browser to get the elements and their positions
    const js_code = `
    var items = Array.from(document.querySelectorAll('*')).map(function(element) {
        var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        var vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        
        var rects = Array.from(element.getClientRects()).filter(function(bb) {
          var center_x = bb.left + bb.width / 2;
          var center_y = bb.top + bb.height / 2;
          var elAtCenter = document.elementFromPoint(center_x, center_y);

          return elAtCenter === element || element.contains(elAtCenter);
        }).map(function(bb) {
          return {
            left: Math.max(0, bb.left),
            top: Math.max(0, bb.top),
            right: Math.min(vw, bb.right),
            bottom: Math.min(vh, bb.bottom),
            width: bb.right - bb.left,
            height: bb.bottom - bb.top
          };
        });

        return {
          tag: element.tagName,
          rects: rects,
          link: element.href || null  // Add this line to get the href attribute
        };
    }).filter(function(item) {
        return item.rects.length > 0;
    });
    return items;
    `;
    
    // Take a screenshot
    const screenshot = await driver.takeScreenshot();
    const elementsInfo = await driver.executeScript(js_code); // This line was missing

    async function processElements(elementsInfo, screenshotBase64) {
      // Load the screenshot into a canvas
      const image = await loadImage(`data:image/png;base64,${screenshotBase64}`);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
    
      // Register a font
      registerFont('Arial.ttf', { family: 'Arial' }); // Make sure the font file is in your project directory
    
      const tagNames = ["TEXTAREA", "SELECT", "BUTTON", "A", "IFRAME", "VIDEO"];
      const filteredElements = elementsInfo.filter(e => tagNames.includes(e.tag));
    
      const elementCenters = {};
    
      filteredElements.forEach((element, index) => {
        element.rects.forEach(rect => {
          const center_x = (rect.left + rect.right) / 2;
          const center_y = (rect.top + rect.bottom) / 2;
          const label = index + 1;
          elementCenters[label] = {
            position: { x: center_x, y: center_y },
            tag: element.tag,
            link: element.link || null
          };
    
          // Draw the rectangle
          ctx.strokeStyle = randomColor();
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
    
          // Draw the label
          const fontSize = 14; // Adjust as needed
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fillRect(rect.left, rect.top - fontSize, ctx.measureText(label.toString()).width + 4, fontSize);
          ctx.fillStyle = 'white';
          ctx.fillText(label.toString(), rect.left + 2, rect.top - 2);
        });
      });
    
      return { elementCenters, imageBuffer: canvas.toBuffer() };
    }
    
    // Usage example within the /open-url route
    const { elementCenters, imageBuffer } = await processElements(elementsInfo, screenshot);

    // Check if imageBuffer is defined
    if (!imageBuffer) {
      console.error('imageBuffer is undefined.');
      return res.status(500).send('Failed to generate the image buffer.');
    }

    // Save the image buffer as a new PNG file
    const newImageFilename = 'modified_screenshot.png';
    await fsp.writeFile(newImageFilename, imageBuffer);

    // Prepare form data for POST request
    const formData = new FormData();
    try {
      // Create a read stream from the saved file and append it to the formData
      const fileStream = fs.createReadStream(newImageFilename);
      formData.append('image', fileStream, { filename: newImageFilename, contentType: 'image/png' });
    } catch (error) {
      console.error('Error appending data to FormData:', error);
      return res.status(500).send('An error occurred while preparing the screenshot for upload.');
    }

    // Send the processed image to the Flask server
    const flaskServerUrl = 'https://glider-summary-urgently.ngrok-free.app/upload'; // Flask server URL
    const response = await fetch(flaskServerUrl, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders() // This is necessary for multipart/form-data
    });
    const jsonResponse = await response.json();

    // Clean up the image file after sending
    // await fsp.unlink(imagePath);

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

app.get('/accessibility-tree', async (req, res) => {
  try {
    const driver = await getDriver();
    const accessibilityTree = await driver.executeScript('return document.accessibilityTree;');
    res.json(accessibilityTree);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while retrieving the accessibility tree.');
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});