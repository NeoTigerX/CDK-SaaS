#!/bin/bash

# CDK SaaS Deployment Script
set -e

echo "🚀 Starting CDK SaaS deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK is not installed. Installing..."
    npm install -g aws-cdk
fi

# Check AWS credentials
echo "🔍 Checking AWS credentials..."
aws sts get-caller-identity

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Bootstrap CDK if needed
echo "🚧 Bootstrapping CDK..."
cdk bootstrap

# Deploy the stack
echo "🚀 Deploying CDK stack..."
cdk deploy --require-approval never

# Get outputs
echo "📋 Getting stack outputs..."
API_URL=$(aws apigateway get-rest-apis --query 'items[?name==`SaaS API`].id' --output text)
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name CdkSaaSStack --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' --output text)
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name CdkSaaSStack --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' --output text)

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Stack Outputs:"
echo "API Gateway URL: https://${API_URL}.execute-api.$(aws configure get region).amazonaws.com/prod"
echo "User Pool ID: ${USER_POOL_ID}"
echo "User Pool Client ID: ${USER_POOL_CLIENT_ID}"
echo ""
echo "🧪 To run load tests:"
echo "artillery run artillery-config.yml"
echo ""
echo "🔧 To destroy the stack:"
echo "cdk destroy"
