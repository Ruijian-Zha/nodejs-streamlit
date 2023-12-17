import streamlit as st
import requests

st.set_page_config(
    page_title="Agent2.ai",
    initial_sidebar_state='collapsed'
    )

# Streamlit interface
st.title("Agent2.ai  ")

with st.sidebar:
    st.header("God Mode")
    god_mode = st.checkbox("Enable God Mode", True)

# Define the endpoint URL
url = "https://verified-pangolin-terribly.ngrok-free.app/open-shopify"


with st.container():
    # for message in st.session_state["messages"]:
    #    st.markdown(message)

    user_input = st.chat_input("Type something...")
    if user_input:
        with st.chat_message("user"):
            st.write(user_input)

        if "open shopify" in user_input.lower():
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    with st.chat_message("assistant"):
                        st.write("Shopify is now open.")
                    st.success("Shopify is opened in Chrome!")
                else:
                    st.error(f"Failed to open Shopify: {response.text}")
            except requests.exceptions.RequestException as e:
                st.error(f"Request failed: {e}")
