import streamlit as st
import requests

# Streamlit interface
st.title("Shopify Opener")

# Define the endpoint URL
url = "https://verified-pangolin-terribly.ngrok-free.app/open-shopify"

# When the button is clicked, make a GET request to the server
if st.button("Open Shopify"):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            st.success("Shopify is opened in Chrome!")
        else:
            st.error(f"Failed to open Shopify: {response.text}")
    except requests.exceptions.RequestException as e:
        st.error(f"Request failed: {e}")