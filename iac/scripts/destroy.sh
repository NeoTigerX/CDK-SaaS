#!/bin/bash

# CDK SaaS Destruction Script
set -e

echo "🗑️ Starting CDK SaaS destruction..."

# Confirm destruction
read -p "⚠️  Are you sure you want to destroy the CDK SaaS stack? This will delete all resources! (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Destruction cancelled."
    exit 1
fi

# Destroy the stack
echo "🚨 Destroying CDK stack..."
cdk destroy --force

echo "✅ Stack destruction completed!"
