#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <new-base-url>"
    echo "Example: $0 newclientid123456"
    exit 1
fi

NEW_CLIENT_ID=$1
COGNITO_FILE="resources/frontend/src/services/cognito.js"

if [ ! -f "$COGNITO_FILE" ]; then
    echo "Error: File $COGNITO_FILE not found"
    exit 1
fi

sed -i "s/CLIENT_ID = \"[a-z0-9]*\"/CLIENT_ID = \"$NEW_CLIENT_ID\"/g" "$COGNITO_FILE"

if [ $? -eq 0 ]; then
    echo "Base URL successfully updated to: $NEW_CLIENT_ID"
    echo "Modified file: $COGNITO_FILE"
else
    echo "Error updating base URL"
    exit 1
fi