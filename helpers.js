const fs = require('fs');
const fsp = fs.promises;
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();
const FormData = require('form-data');

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

async function interactWithWebDriver(url, user_input) {
  const driver = await getDriver();
  await driver.get(url);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const screenshot = await driver.takeScreenshot();
  const elementsInfo = await driver.executeScript(js_code);
  return { screenshot, elementsInfo };
}

async function executeJavaScript(driver) {
  const elementsInfo = await driver.executeScript(js_code);
  return elementsInfo;
}

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
