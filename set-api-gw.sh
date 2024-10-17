#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <new-base-url>"
    echo "Example: $0 https://api.example.com"
    exit 1
fi

NEW_URL=$1
API_FILE="resources/frontend/src/services/api.js"

if [ ! -f "$API_FILE" ]; then
    echo "Error: File $API_FILE not found"
    exit 1
fi

sed -i "s|baseURL: \".*\"|baseURL: \"$NEW_URL\"|" "$API_FILE"

if [ $? -eq 0 ]; then
    echo "Base URL successfully updated to: $NEW_URL"
    echo "Modified file: $API_FILE"
else
    echo "Error updating base URL"
    exit 1
fi