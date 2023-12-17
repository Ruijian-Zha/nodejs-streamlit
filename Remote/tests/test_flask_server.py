import unittest

from flask import Flask, jsonify
from Remote import flask_server


class TestFlaskServer(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.client = self.app.test_client()

    def test_upload_image_to_github(self):
        # Test with valid image path and valid GitHub credentials
        output = flask_server.upload_image_to_github('valid_image_path', 'valid_username', 'valid_repo', 'valid_token')
        self.assertTrue(output.startswith('https://'))

        # Test with invalid image path
        output = flask_server.upload_image_to_github('invalid_image_path', 'valid_username', 'valid_repo', 'valid_token')
        self.assertEqual(output, 'Error: Unable to upload file')

        # Test with invalid GitHub credentials
        output = flask_server.upload_image_to_github('valid_image_path', 'invalid_username', 'invalid_repo', 'invalid_token')
        self.assertEqual(output, 'Error: Bad credentials')

    def test_upload_to_github(self):
        # Test with all required data in the request and a valid image path
        response = self.client.post('/upload', data={'image_path': 'valid_image_path'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()['url'].startswith('https://'))

        # Test with missing data in the request
        response = self.client.post('/upload', data={})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()['error'], 'Missing data')

        # Test with an invalid image path
        response = self.client.post('/upload', data={'image_path': 'invalid_image_path'})
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.get_json()['error'], 'Error: Unable to upload file')

    def test_upload_to_github_base64(self):
        # Test with valid base64 encoded image and valid credentials
        valid_image = 'valid_base64_encoded_image' # Placeholder base64
        valid_username = 'valid_username'
        valid_repo = 'valid_repo'
        valid_token = 'valid_token'
        valid_filename = 'image.png'

        output = flask_server.upload_image_to_github_base64(valid_image, valid_username, valid_repo, valid_token, valid_filename)
        self.assertTrue(output.startswith('https://'))

                # Test with invalid base64 encoded image
        invalid_image = 'invalid_base64_encoded_image' # Placeholder base64
        output = flask_server.upload_image_to_github_base64(invalid_image, valid_username, valid_repo, valid_token, valid_filename)
        self.assertEqual(output, 'Error: Unable to upload file')

        # Test with invalid username
        invalid_username = 'invalid_username'
        output = flask_server.upload_image_to_github_base64(valid_image, invalid_username, valid_repo, valid_token, valid_filename)
        self.assertEqual(output, 'Error: Bad credentials')

        # Test with invalid repo
        invalid_repo = 'invalid_repo'
        output = flask_server.upload_image_to_github_base64(valid_image, valid_username, invalid_repo, valid_token, valid_filename)
        self.assertEqual(output, 'Error: Repository not found')

        # Test with invalid token
        invalid_token = 'invalid_token'
        output = flask_server.upload_image_to_github_base64(valid_image, valid_username, valid_repo, invalid_token, valid_filename)
        self.assertEqual(output, 'Error: Bad credentials')

        # Test with invalid image filename
        invalid_filename = '/invalid_image.png'
        output = flask_server.upload_image_to_github_base64(valid_image, valid_username, valid_repo, valid_token, invalid_filename)
        self.assertEqual(output, 'Error: Invalid filename')

        if __name__ == '__main__':
            unittest.main()
