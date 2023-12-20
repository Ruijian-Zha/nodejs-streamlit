# Import necessary libraries
import streamlit as st
import requests
import json
import os
from dotenv import load_dotenv
import time
import uuid
from urllib.parse import urlparse, urlunparse
import re

# Load the .env file where your OPENAI_API_KEY is stored
load_dotenv(override=True)

# st.title("Echo Bot")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Streamlit interface configuration must be the first command
st.set_page_config(
    page_title="Agent2.ai",
    initial_sidebar_state='collapsed'
)

# Rest of your Streamlit code follows
st.title("Agent2.ai")

with st.sidebar:
    st.header("God Mode")
    god_mode = st.checkbox("Enable God Mode", True)

# Define the base endpoint URL
base_url = "https://verified-pangolin-terribly.ngrok-free.app/open-url"

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# React to user input
if prompt := st.chat_input("What is up?"):
    # Display user message in chat message container
    st.chat_message("user").markdown(prompt)
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})


        # Start timing before the request
    start_time = time.time()

    # Split the user input based on '$'
    input_parts = prompt.split('$')
    # Extract the input text and URL, filtering out any empty space
    input_text, input_url = map(lambda x: x.strip(), input_parts) if len(input_parts) == 2 else ("", "")
    # Print the extracted input text and URL
    print(f"Input Text: {input_text}")
    print(f"Input URL: {input_url}")

    # Check if the input is a URL, prepend with http:// if no scheme is present
    parsed_input = urlparse(input_url)
    if not parsed_input.scheme:
        input_url = f"http://{input_url}"
        parsed_input = urlparse(input_url)

    if parsed_input.scheme and parsed_input.netloc:
        # Construct the full endpoint URL with the user input as a query parameter
        endpoint_url = f"{base_url}?url={requests.utils.quote(input_url)}&user_input={requests.utils.quote(input_text)}"
        try:
            response = requests.get(endpoint_url)
            # Print out the response in JSON format
            if response.status_code == 200:
                # print(response.headers['Content-Type'])
                response_text = response.text
                print(response.text)

                # print("data", data)
                st.success(f"{input_url} is opened in Chrome!")
            else:
                st.error(f"Failed to open {input_url}: {response.text}")
        except requests.exceptions.RequestException as e:
            response = "Failed to process the request."
            st.error(f"Request failed: {e}")
    else:
        st.error("Please enter a valid URL.")

    # Calculate response time
    response_time = time.time() - start_time

    # Append the assistant's message to the conversation history

    st.info(f'Response time: {response_time:.2f} seconds', icon="ℹ️")

    # response = f"Echo: {prompt}"
    # Display assistant response in chat message container
    with st.chat_message("assistant"):
        # Assuming response_text contains the message with the URL
        url_pattern = r'https://github\.com/Ruijian-Zha/My_Image/blob/main/\S+\.png'
        found_urls = re.findall(url_pattern, response_text)

        if found_urls:
            # Convert GitHub URL to raw content URL
            raw_image_url = found_urls[0].replace('github.com', 'raw.githubusercontent.com').replace('/blob', '')
            # Display the image using Streamlit
            st.image(raw_image_url)
        else:
            st.markdown(response_text)  
    # Add assistant response to chat history
    st.session_state.messages.append({"role": "assistant", "content": response})