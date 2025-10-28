#!/bin/bash

# Load testing script for CDK SaaS
set -e

echo "🧪 Starting load tests..."

# Check if Artillery is installed
if ! command -v artillery &> /dev/null; then
    echo "📦 Installing Artillery..."
    npm install -g artillery
fi

# Get API Gateway URL from stack outputs
API_URL=$(aws cloudformation describe-stacks --stack-name CdkSaaSStack --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)

if [ -z "$API_URL" ]; then
    echo "❌ Could not find API Gateway URL. Make sure the stack is deployed."
    exit 1
fi

echo "🎯 Testing API at: $API_URL"

# Update artillery config with actual URL
sed "s|https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod|$API_URL|g" artillery-config.yml > artillery-config-test.yml

# Run load tests
echo "🚀 Running load tests..."
artillery run artillery-config-test.yml

# Clean up
rm artillery-config-test.yml

echo "✅ Load tests completed!"
