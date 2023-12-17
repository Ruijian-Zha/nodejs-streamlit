import io
import unittest
from flask import Flask, jsonify, request
from Remote import flask_server


class TestFlaskServer(unittest.TestCase):
    def setUp(self):
        flask_server.app.testing = True
        self.client = flask_server.app.test_client()

    def test_upload_image_to_github(self):
        # Test with valid image path and valid GitHub credentials
        output = flask_server.upload_image_to_github('valid_image_path', 'valid_username', 'valid_repo', 'valid_token')
        self.assertTrue(output.startswith('https://'))

        # Test with invalid image path
        output = flask_server.upload_image_to_github('invalid_image_path', 'valid_username', 'valid_repo', 'valid_token')
        self.assertIn('Error', output)

        # Test with invalid GitHub credentials
        output = flask_server.upload_image_to_github('valid_image_path', 'invalid_username', 'invalid_repo', 'invalid_token')
        self.assertEqual(output, 'Error: Bad credentials')

    def test_upload_to_github(self):
        # Test with all required data in the request and a valid image path
        response = self.client.post('/upload', data={'image_path': 'valid_image_path'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('url', response.get_json())

        # Test with missing data in the request
        response = self.client.post('/upload', data={})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()['error'], 'Missing data')

        # Test with an invalid image path
        response = self.client.post('/upload', data={'image_path': 'invalid_image_path'})
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.get_json()['error'], 'Error: Unable to upload file')

    def test_retrieve_request_data(self):
        with flask_server.app.test_client() as c:
            data = {'image': (io.BytesIO(b'my file contents'), 'test.png')}
            response = c.post('/upload', data=data, content_type='multipart/form-data')
            result = flask_server.retrieve_request_data(response.request)
            self.assertIsNotNone(result)

        with flask_server.app.test_client() as c:
            data = {}
            response = c.post('/upload', data=data, content_type='multipart/form-data')
            result = flask_server.retrieve_request_data(response.request)
            self.assertIsNone(result)

    def test_check_data(self):
        data = {'encoded_image': 'data', 'username': 'user', 'repo': 'repo', 'token': 'token'}
        self.assertTrue(flask_server.check_data(data))

        data = {'encoded_image': '', 'username': '', 'repo': 'repo', 'token': 'token'}
        self.assertFalse(flask_server.check_data(data))

    def test_upload_image(self):
        data = {'encoded_image': 'valid_base64', 'username': 'user', 'repo': 'repo', 'token': 'token', 'image_filename': 'test.png'}
        output = flask_server.upload_image(data)
        self.assertNotEqual(output, 'Error: Invalid data provided')

        data = {'encoded_image': '', 'username': 'user', 'repo': 'repo', 'token': 'token', 'image_filename': ''}
        output = flask_server.upload_image(data)
        self.assertEqual(output, 'Error: Invalid data provided')

if __name__ == '__main__':
    unittest.main()
