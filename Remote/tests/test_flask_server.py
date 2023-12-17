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

    def test_upload_to_github_new(self):
        # Test upload_to_github with valid data
        with self.app.test_request_context(data={'image': 'valid_image'}):
            response = flask_server.upload_to_github()
            self.assertEqual(response.status_code, 200)
            self.assertTrue('url' in response.get_json())

        # Test upload_to_github with data missing
        with self.app.test_request_context(data={}):
            response = flask_server.upload_to_github()
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.get_json()['error'], 'Missing data')

        # Test upload_to_github with invalid data causing internal server error
        with self.app.test_request_context(data={'image': 'invalid_image'}):
            response = flask_server.upload_to_github()
            self.assertEqual(response.status_code, 500)
            self.assertTrue('error' in response.get_json())

        # Test with an invalid image path
        response = self.client.post('/upload', data={'image_path': 'invalid_image_path'})
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.get_json()['error'], 'Error: Unable to upload file')

    def test_retrieve_data(self):
        # Test retrieve_data with valid data
        with self.app.test_request_context(data={'image': 'valid_image'}):
            data = flask_server.retrieve_data()
            self.assertIn('image', data)
            self.assertIn('username', data)
            self.assertIn('repo', data)
            self.assertIn('token', data)

        # Test retrieve_data with no image provided
        with self.app.test_request_context(data={}):
            response, status_code = flask_server.retrieve_data()
            self.assertEqual(response.get_json()['error'], 'No image file provided')
            self.assertEqual(status_code, 400)

    def test_check_data(self):
        # Test check_data with all data present
        data = {'image': 'valid_image', 'username': 'valid_username', 'repo': 'valid_repo', 'token': 'valid_token'}
        self.assertTrue(flask_server.check_data(data))

        # Test check_data with missing data
        data = {'image': 'valid_image', 'username': 'valid_username', 'repo': 'valid_repo', 'token': None}
        self.assertFalse(flask_server.check_data(data))

    def test_upload_image(self):
        # Test upload_image with valid data
        data = {'image': 'valid_image', 'username': 'valid_username', 'repo': 'valid_repo', 'token': 'valid_token'}
        with self.app.test_request_context():
            response = flask_server.upload_image(data)
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.get_json()['url'].startswith('https://'))

        # Test upload_image with invalid data returning an error message
        data = {'image': 'invalid_image', 'username': 'invalid_username', 'repo': 'invalid_repo', 'token': 'invalid_token'}
        with self.app.test_request_context():
            response = flask_server.upload_image(data)
            self.assertEqual(response.status_code, 500)
            self.assertTrue('error' in response.get_json())

if __name__ == '__main__':
    unittest.main()
