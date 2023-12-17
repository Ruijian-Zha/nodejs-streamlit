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

if __name__ == '__main__':
    unittest.main()
