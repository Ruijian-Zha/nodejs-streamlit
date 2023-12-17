from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import base64
import requests
from datetime import datetime

# Load environment variables from .env file
load_dotenv(override=True)

app = Flask(__name__)


def upload_image_to_github(image_path, username, repo, token):
    """
    Upload an image to a specified GitHub repository.

    Args:
    image_path (str): The local path to the image file.
    username (str): Your GitHub username.
    repo (str): The name of the GitHub repository.
    token (str): Your GitHub Personal Access Token.

    Returns:
    str: The URL of the uploaded file if successful, else an error message.
    """
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode()

    url = f"https://api.github.com/repos/{username}/{repo}/contents/{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
    headers = {"Authorization": f"token {token}"}
    payload = {"message": "Upload image", "content": encoded_string}

    response = requests.put(url, json=payload, headers=headers)

    if response.status_code == 201:
        return response.json()['content']['html_url']
    else:
        return "Error: " + response.json().get('message', 'Unable to upload file')

@app.route('/upload', methods=['POST'])
def upload_to_github():
    """
    Handle a POST request to the '/upload' route, retrieve data from the request and environment variables, check for necessary data, and call the function to upload an image to GitHub.

    This function does not have explicit parameters. Instead, it retrieves 'image_path', 'username', 'repo', and 'token' from the request data and environment variables. 'image_path' is the path to the image file that will be uploaded. 'username', 'repo', and 'token' are GitHub credentials required to authenticate the upload request.

    Returns:
        A JSON response with either the URL of the uploaded image upon a successful upload or an error message indicating failure.

    Exceptions:
        Catches any exceptions during the image upload and returns a JSON response with the error message.
    """
    """
    Handle a POST request to the '/upload' route, retrieve data from the request, check for necessary data,
    and call the function to upload an image to GitHub.

    The function has no explicit parameters. It retrieves 'image_path', 'username', 'repo', and 'token'
    from the request data and environment variables.

    Returns:
        A JSON response with either the URL of the uploaded image upon a successful upload
        or an error message indicating failure.

    Exceptions:
        Catches any exceptions during the image upload and returns a JSON response with the error message.
    """
    # Retrieve data from the request
    image_path = request.form.get('image_path')
    username = os.getenv('USERNAME')
    repo = os.getenv('REPO')
    token = os.getenv('TOKEN')

    if not image_path or not username or not repo or not token:
        return jsonify({"error": "Missing data"}), 400

    # Call the existing function to upload the image
    try:
        upload_url = upload_image_to_github(image_path, username, repo, token)
        if upload_url.startswith("Error"):
            return jsonify({"error": upload_url}), 500
        return jsonify({"url": upload_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)