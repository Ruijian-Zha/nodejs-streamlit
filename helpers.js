/**
 * Utility functions to support server.js in handling HTTP requests,
 * interacting with the web driver, and managing file uploads.
 * 
 * Dependencies: fs, node-fetch, FormData
 */

const fs = require('fs');
const fsp = fs.promises;
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();
const FormData = require('form-data');

/**
 * Handles HTTP requests by extracting the URL and user input from the query parameters.
 * 
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object used to send back a response.
 * @returns {Object} - An object with url and user_input as properties.
 */
function handleHttpRequest(req, res) {
  const url = req.query.url || 'http://www.google.com';
  const user_input = req.query.user_input;
  if (!user_input) {
    return res.status(400).send('No user input provided.');
  }
  console.log('URL:', url);
  console.log('User input:', user_input);
  return { url, user_input };
}

/**
 * Interacts with a web driver to navigate to a URL and take a screenshot.
 * 
 * @async
 * @param {string} url - The URL to navigate to.
 * @param {string} user_input - User input required for interaction.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the screenshot and elements information.
 */
async function interactWithWebDriver(url, user_input) {
  const driver = await getDriver();
  await driver.get(url);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const screenshot = await driver.takeScreenshot();
  const elementsInfo = await driver.executeScript(js_code);
  return { screenshot, elementsInfo };
}

/**
 * Executes JavaScript code within the context of the current page of the web driver.
 * 
 * @async
 * @param {Object} driver - The web driver instance.
 * @returns {Promise<Object>} - A promise that resolves to the result of the executed JavaScript.
 */
async function executeJavaScript(driver) {
  const elementsInfo = await driver.executeScript(js_code);
  return elementsInfo;
}

/**
 * Handles the uploading of an image file to a specified server URL.
 * 
 * @async
 * @param {Buffer} imageBuffer - The buffer of the image to upload.
 * @param {string} newImageFilename - The filename for the uploaded image.
 * @param {string} flaskServerUrl - The URL of the Flask server to upload the image to.
 * @returns {Promise<string>} - A promise that resolves to the URL of the uploaded image.
 */
async function handleFileUpload(imageBuffer, newImageFilename, flaskServerUrl) {
  if (!imageBuffer) {
    console.error('imageBuffer is undefined.');
    return res.status(500).send('Failed to generate the image buffer.');
  }
  await fsp.writeFile(newImageFilename, imageBuffer);
  const formData = new FormData();
  try {
    const fileStream = fs.createReadStream(newImageFilename);
    formData.append('image', fileStream, { filename: newImageFilename, contentType: 'image/png' });
  } catch (error) {
    console.error('Error appending data to FormData:', error);
    return res.status(500).send('An error occurred while preparing the screenshot for upload.');
  }
  const response = await fetch(flaskServerUrl, {
    method: 'POST',
    body: formData,
    headers: formData.getHeaders()
  });
  const jsonResponse = await response.json();
  if (jsonResponse.error) {
    console.error('Error uploading file:', jsonResponse.error);
    res.status(500).send(`An error occurred while uploading the screenshot: ${jsonResponse.error}`);
  } else {
    const uploadedUrl = jsonResponse.img_url;
    console.log('Uploaded URL:', uploadedUrl);
    return uploadedUrl;
  }
}
