import streamlit as st
import requests
from urllib.parse import urlparse, urlunparse

st.set_page_config(
    page_title="Agent2.ai",
    initial_sidebar_state='collapsed'
)

# Streamlit interface
st.title("Agent2.ai")

with st.sidebar:
    st.header("God Mode")
    god_mode = st.checkbox("Enable God Mode", True)

# Define the base endpoint URL
base_url = "https://verified-pangolin-terribly.ngrok-free.app/open-url"

with st.container():
    user_input = st.chat_input("Type something...")
    if user_input:
        with st.chat_message("user"):
            st.write(user_input)

        # Check if the input is a URL, prepend with http:// if no scheme is present
        parsed_input = urlparse(user_input)
        if not parsed_input.scheme:
            user_input = f"http://{user_input}"
            parsed_input = urlparse(user_input)

        if parsed_input.scheme and parsed_input.netloc:
            # Construct the full endpoint URL with the user input as a query parameter
            endpoint_url = f"{base_url}?url={requests.utils.quote(user_input)}"
            try:
                response = requests.get(endpoint_url)
                if response.status_code == 200:
                    with st.chat_message("assistant"):
                        st.write(f"{user_input} is now open.")
                    st.success(f"{user_input} is opened in Chrome!")
                else:
                    st.error(f"Failed to open {user_input}: {response.text}")
            except requests.exceptions.RequestException as e:
                st.error(f"Request failed: {e}")
        else:
            st.error("Please enter a valid URL.")