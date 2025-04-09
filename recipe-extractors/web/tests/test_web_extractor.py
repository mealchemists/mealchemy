import unittest
from unittest.mock import patch, MagicMock
import json
import re
from web.parse import *
class TestDataProcessing(unittest.TestCase):

    def test_clean_answer(self):
        raw_data = "Some text before {\"'key\": \"value\"} and after"
        expected_result = {"key": "value"}
        result = clean_answer(raw_data)
        self.assertEqual(result, expected_result)

    def test_replace_separators_with_underscore(self):
        input_string = "This is a test, with some -separators- and spaces."
        expected_result = "This_is_a_test__with_some__separators__and_spaces_"
        result = replace_separators_with_underscore(input_string)
        self.assertEqual(result, expected_result)

    def test_ensure_keys_with_dict(self):
        schema = {
            "name": "Unknown",
            "age": 0,
            "address": {"street": "Unknown"}
        }
        data = {"name": "John"}
        expected_result = {
            "name": "John",
            "age": 0,
            "address": {"street": "Unknown"}
        }
        result = ensure_keys(data, schema)
        self.assertEqual(result, expected_result)

    def test_ensure_keys_with_list(self):
        schema = [{"name": "Unknown", "age": 0}]
        data = [{"name": "John"}]
        expected_result = [{"name": "John", "age": 0}]
        result = ensure_keys(data, schema)
        self.assertEqual(result, expected_result)

    def test_transform_dict_keys(self):
        data = {
            "first-name": "John",
            "last-name": "Doe",
            "details": {"address-line-1": "123 Main St"}
        }
        expected_result = {
            "first_name": "John",
            "last_name": "Doe",
            "details": {"address_line_1": "123 Main St"}
        }
        result = transform_dict_keys(data)
        self.assertEqual(result, expected_result)

    @patch('your_module.parse_with_openai')  # Mocking parse_with_openai
    def test_process_data(self, mock_parse_with_openai):
        # Mock the parsed data returned by parse_with_openai
        mock_parse_with_openai.return_value = {
            "first-name": "John",
            "last-name": "Doe",
            "details": {"address-line-1": "123 Main St"}
        }
        
        schema = {
            "first-name": "Unknown",
            "last-name": "Unknown",
            "details": {"address-line-1": "Unknown"}
        }
        
        dom_chunks = "Some string data that would normally be parsed by OpenAI"
        expected_result = {
            "first_name": "John",
            "last_name": "Doe",
            "details": {"address_line_1": "123 Main St"}
        }
        
        result = process_data(dom_chunks, schema)
        self.assertEqual(result, expected_result)
        
        # Check if parse_with_openai was called
        mock_parse_with_openai.assert_called_once_with(dom_chunks)


if __name__ == '__main__':
    unittest.main()