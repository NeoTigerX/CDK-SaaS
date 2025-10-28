# Deployment Guide

## Prerequisites

1. **AWS Account**: Ensure you have an AWS account with appropriate permissions
2. **AWS CLI**: Install and configure AWS CLI with your credentials
3. **Node.js**: Install Node.js 18 or higher
4. **CDK CLI**: Install AWS CDK CLI globally

```bash
npm install -g aws-cdk
```

## Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd cdk-saas-ts
npm install
```

### 2. Configure AWS
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your default output format (json)
```

### 3. Deploy
```bash
# Make scripts executable (Linux/Mac)
chmod +x scripts/*.sh

# Deploy the stack
./scripts/deploy.sh
```

## Manual Deployment

### 1. Bootstrap CDK (First Time Only)
```bash
cdk bootstrap
```

### 2. Build and Deploy
```bash
npm run build
cdk deploy
```

### 3. Get Outputs
After deployment, you'll see outputs like:
```
CdkSaaSStack.ApiGatewayUrl = https://abc123.execute-api.us-east-1.amazonaws.com/prod
CdkSaaSStack.UserPoolId = us-east-1_ABC123
CdkSaaSStack.UserPoolClientId = 1234567890
```

## GitHub Actions Setup

### 1. Repository Secrets
Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 2. Workflow
The GitHub Actions workflow will automatically:
- Run the frontend dev server (`npm run start`) on every push/PR (in the `frontend` folder)
- Deploy the IaC/CDK stack (`cdk deploy`) after installing dependencies (in the `iac` folder) on main branch pushes

See `.github/workflows/deploy.yml` for details.

## Testing

### Load Testing
```bash
# Install Artillery
npm install -g artillery

# Run load tests
./scripts/test.sh
```

### Manual API Testing
```bash
# Health check
curl https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod/health

# Create tenant (requires Cognito token)
curl -X POST https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod/tenants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Tenant","email":"test@example.com","plan":"FREE"}'
```

## Monitoring

### CloudWatch Logs
- Lambda function logs: `/aws/lambda/TenantLambda`, `/aws/lambda/OrderLambda`
- API Gateway logs: `/aws/apigateway/SaaSApi`

### DynamoDB Metrics
- Monitor table read/write capacity
- Check for throttling events
- Review item count and size

### API Gateway Metrics
- Request count and latency
- Error rates (4xx, 5xx)
- Cache hit rates

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Required**
   ```bash
   cdk bootstrap
   ```

2. **Permission Denied**
   - Ensure your AWS credentials have sufficient permissions
   - Check IAM policies for CDK, Lambda, DynamoDB, API Gateway, Cognito

3. **Lambda Function Errors**
   - Check CloudWatch logs
   - Verify environment variables are set correctly
   - Ensure DynamoDB table permissions

4. **API Gateway CORS Issues**
   - CORS is pre-configured for all origins
   - Check browser developer tools for CORS errors

### Debug Commands

```bash
# Check CDK context
cdk context

# View synthesized CloudFormation
cdk synth

# Check AWS resources
aws cloudformation describe-stacks --stack-name CdkSaaSStack

# Check Lambda functions
aws lambda list-functions

# Check DynamoDB tables
aws dynamodb list-tables
```

## Cleanup

### Destroy Stack
```bash
./scripts/destroy.sh
```

### Manual Cleanup
```bash
cdk destroy
```

**Warning**: This will delete all resources including data in DynamoDB tables.

## Cost Optimization

### Development Environment
- Use `cdk deploy --context environment=dev` for development
- Consider using smaller instance types
- Set up billing alerts

### Production Environment
- Enable DynamoDB auto-scaling
- Set up CloudWatch alarms
- Consider using provisioned capacity for predictable workloads
- Implement proper backup strategies

## Security Considerations

1. **IAM Roles**: Follow least privilege principle
2. **API Keys**: Rotate regularly
3. **Cognito**: Configure proper password policies
4. **DynamoDB**: Enable encryption at rest
5. **API Gateway**: Use HTTPS only
6. **Lambda**: Set appropriate timeout and memory limits

## Scaling Considerations

### Auto-scaling
- Lambda functions scale automatically
- DynamoDB on-demand billing scales with demand
- API Gateway handles millions of requests

### Performance Optimization
- Use DynamoDB GSI for efficient queries
- Implement caching where appropriate
- Monitor and optimize Lambda cold starts
- Use connection pooling for database connections

## Backup and Recovery

### DynamoDB
- Enable point-in-time recovery
- Set up automated backups
- Test restore procedures

### Infrastructure
- Use CDK for infrastructure as code
- Version control all changes
- Document deployment procedures
- Maintain rollback procedures
