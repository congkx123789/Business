#!/bin/bash

# Test Image Upload Script
# Tests the image upload functionality locally

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_BASE_URL="${API_BASE_URL:-http://localhost:8080/api}"
TOKEN="${TOKEN:-}"
CAR_ID="${CAR_ID:-1}"
IMAGE_PATH="${IMAGE_PATH:-assets/images/test-image.jpg}"

echo -e "${GREEN}Testing Image Upload${NC}"
echo "API Base URL: $API_BASE_URL"
echo "Car ID: $CAR_ID"
echo ""

# Check if image file exists
if [ ! -f "$IMAGE_PATH" ]; then
    echo -e "${RED}Error: Image file not found: $IMAGE_PATH${NC}"
    echo "Please provide a valid image file path"
    exit 1
fi

# Check if token is provided
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}Warning: No token provided. You may need to authenticate first.${NC}"
    echo "Get token from: POST $API_BASE_URL/auth/login"
    read -p "Enter JWT token (or press Enter to skip): " TOKEN
fi

# Upload image
echo -e "${YELLOW}Uploading image...${NC}"

if [ -z "$TOKEN" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/car-images/upload" \
        -F "file=@$IMAGE_PATH" \
        -F "carId=$CAR_ID")
else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/car-images/upload" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$IMAGE_PATH" \
        -F "carId=$CAR_ID")
fi

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}Upload successful!${NC}"
    echo "$BODY" | jq '.'
    
    IMAGE_URL=$(echo "$BODY" | jq -r '.imageUrl // empty')
    if [ -n "$IMAGE_URL" ]; then
        echo ""
        echo "Image URL: $IMAGE_URL"
        
        # Verify CDN URL
        if echo "$IMAGE_URL" | grep -qE "cloudfront|cdn"; then
            echo -e "${GREEN}✓ Image URL is a CDN URL${NC}"
        else
            echo -e "${YELLOW}⚠ Image URL is not a CDN URL${NC}"
        fi
    fi
else
    echo -e "${RED}Error uploading image${NC}"
    echo "HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

echo ""
echo -e "${GREEN}Test completed!${NC}"

