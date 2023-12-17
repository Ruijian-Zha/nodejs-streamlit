from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import base64
import requests
from datetime import datetime

# Load environment variables from .env file
load_dotenv(override=True)

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_to_github():
    """
    Handle a POST request to the '/upload' route, retrieve data from the request, check for necessary data,
    and call the function to upload a base64 encoded image to GitHub.

    The function has no explicit parameters. It retrieves 'image' (base64 encoded), 'username', 'repo', and 'token'
    from the request data and environment variables.

    Returns:
        A JSON response with either the URL of the uploaded image upon a successful upload
        or an error message indicating failure.

    Exceptions:
        Catches any exceptions during the image upload and returns a JSON response with the error message.
    """
    """
    Handle a POST request to the '/upload' route, retrieve data from the request, check for necessary data,
    and call the function to upload a base64 encoded image to GitHub.

    The function has no explicit parameters. It retrieves 'image' (base64 encoded), 'username', 'repo', and 'token'
    from the request data and environment variables.

    Returns:
        A JSON response with either the URL of the uploaded image upon a successful upload
        or an error message indicating failure.

    Exceptions:
        Catches any exceptions during the image upload and returns a JSON response with the error message.
    """
    # Retrieve data from the request
# Retrieve the file from the request
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    file = request.files['image']
    encoded_image = base64.b64encode(file.read()).decode('utf-8')
    username = os.getenv('USERNAME')
    repo = os.getenv('REPO')
    token = os.getenv('TOKEN')

    if not encoded_image or not username or not repo or not token:
        print(request.form)
        return jsonify({"error": "Missing data"}), 400

    # Call the existing function to upload the image
    try:
        # Generate a unique filename based on the current timestamp
        image_filename = datetime.now().strftime('%Y%m%d%H%M%S') + ".png"
        upload_url = upload_image_to_github_base64(encoded_image, username, repo, token, image_filename)
        if upload_url.startswith("Error"):
            return jsonify({"error": upload_url}), 500
        return jsonify({"url": upload_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def upload_image_to_github_base64(encoded_image, username, repo, token, image_filename):
    """
    Upload a base64 encoded image to a specified GitHub repository.

    Args:
    encoded_image (str): The base64 encoded image string.
    username (str): Your GitHub username.
    repo (str): The name of the GitHub repository.
    token (str): Your GitHub Personal Access Token.
    image_filename (str): The filename to use for the uploaded image.

    Returns:
    str: The URL of the uploaded file if successful, else an error message.
    """
    url = f"https://api.github.com/repos/{username}/{repo}/contents/{image_filename}"
    headers = {"Authorization": f"token {token}"}
    payload = {"message": "Upload image", "content": encoded_image}

    response = requests.put(url, json=payload, headers=headers)

    if response.status_code == 201:
        return response.json()['content']['html_url']
    else:
        return "Error: " + response.json().get('message', 'Unable to upload file')

if __name__ == '__main__':
    app.run(debug=True)