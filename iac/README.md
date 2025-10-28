# CDK Multi-Tenant SaaS Backend

A comprehensive AWS CDK TypeScript project for building a multi-tenant SaaS backend with hexagonal architecture, featuring tenant and order management, authentication, and load testing capabilities.

## 🏗️ Architecture

This project implements a hexagonal architecture (ports and adapters) with the following layers:

- **Domain Layer**: Core business entities and repository interfaces
- **Application Layer**: Business logic and use cases
- **Infrastructure Layer**: AWS services integration (DynamoDB, Lambda, API Gateway, Cognito)

## 🚀 Features

- **Multi-tenant Architecture**: Isolated tenant data with proper access controls
- **Authentication**: AWS Cognito User Pool integration
- **RESTful API**: API Gateway with comprehensive endpoints
- **Database**: DynamoDB with Global Secondary Indexes for efficient querying
- **Serverless**: Lambda functions for business logic
- **Load Testing**: Artillery configuration for performance testing
- **CI/CD**: GitHub Actions for automated deployment
- **TypeScript**: Full type safety throughout the application

## 📋 Prerequisites

- Node.js 18+ 
- AWS CLI configured with appropriate permissions
- AWS CDK CLI (`npm install -g aws-cdk`)
- Artillery for load testing (`npm install -g artillery`)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cdk-saas-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS credentials**
   ```bash
   aws configure
   ```

## 🚀 Deployment

### Quick Deploy
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Deploy
```bash
# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy the stack
npm run deploy
```

## 🧪 Testing

### Load Testing
```bash
chmod +x scripts/test.sh
./scripts/test.sh
```

### Manual Load Testing
```bash
# Update artillery-config.yml with your API Gateway URL
artillery run artillery-config.yml
```

## 📊 API Endpoints

### Authentication Required (Cognito JWT)
- `POST /tenants` - Create a new tenant
- `GET /tenants` - List all tenants
- `GET /tenants/{tenantId}` - Get tenant by ID
- `PUT /tenants/{tenantId}` - Update tenant
- `DELETE /tenants/{tenantId}` - Delete tenant
- `POST /orders` - Create a new order
- `GET /orders` - List orders (with optional filters)
- `GET /orders/{orderId}` - Get order by ID
- `PUT /orders/{orderId}` - Update order
- `DELETE /orders/{orderId}` - Delete order

### Public Endpoints
- `GET /health` - Health check endpoint

## 🗄️ Database Schema

### Tenants Table
- **Primary Key**: `tenantId` (String)
- **GSI**: `email-index` on `email` field
- **Attributes**: name, email, plan, status, settings, timestamps

### Orders Table
- **Primary Key**: `orderId` (String), `tenantId` (String)
- **GSI**: `tenant-index` on `tenantId` and `createdAt`
- **GSI**: `status-index` on `status` and `createdAt`
- **Attributes**: customerId, items, totalAmount, currency, status, paymentStatus, addresses, timestamps

## 🔧 Configuration

### Environment Variables
- `TENANTS_TABLE`: DynamoDB table name for tenants
- `ORDERS_TABLE`: DynamoDB table name for orders

### AWS Resources Created
- DynamoDB Tables (with GSI)
- Lambda Functions
- API Gateway (REST)
- Cognito User Pool
- IAM Roles and Policies

## 📁 Project Structure

```
├── bin/                          # CDK app entry point
├── lib/                          # CDK stack definitions
├── src/
│   ├── domain/                   # Domain layer
│   │   ├── entities/             # Business entities
│   │   └── repositories/         # Repository interfaces
│   ├── application/              # Application layer
│   │   └── services/             # Business logic services
│   ├── infrastructure/          # Infrastructure layer
│   │   ├── persistence/          # Database implementations
│   │   └── api/                  # API implementations
│   └── lambdas/                  # Lambda function handlers
├── scripts/                      # Deployment and testing scripts
├── .github/workflows/            # GitHub Actions CI/CD
└── tests/                        # Test files
```

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflow that:
1. Runs tests and builds the project
2. Deploys to AWS on main branch pushes
3. Outputs API Gateway URLs and resource information
4. Comments deployment status on PRs

### Required Secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## 🧪 Load Testing

The Artillery configuration includes:
- Health check endpoints
- Tenant management operations
- Order management operations
- High load scenarios
- Performance metrics by endpoint

## 🗑️ Cleanup

To destroy all resources:
```bash
chmod +x scripts/destroy.sh
./scripts/destroy.sh
```

Or manually:
```bash
cdk destroy
```

## 📈 Monitoring

After deployment, you can monitor:
- CloudWatch Logs for Lambda functions
- DynamoDB metrics for database performance
- API Gateway metrics for API usage
- CloudWatch Alarms for error rates

## 🔒 Security

- All API endpoints (except health) require Cognito JWT authentication
- DynamoDB access is restricted to Lambda functions
- IAM roles follow least privilege principle
- CORS is configured for cross-origin requests

## 🚀 Scaling

The architecture is designed to scale automatically:
- Lambda functions scale based on demand
- DynamoDB handles high throughput with on-demand billing
- API Gateway scales to handle millions of requests
- Cognito can handle large numbers of users

## 📝 Development

### Adding New Features
1. Define domain entities in `src/domain/entities/`
2. Create repository interfaces in `src/domain/repositories/`
3. Implement business logic in `src/application/services/`
4. Add infrastructure implementations in `src/infrastructure/`
5. Create Lambda handlers in `src/lambdas/`
6. Update CDK stack in `lib/cdk-saas-stack.ts`

### Testing
```bash
npm test
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the GitHub Issues
2. Review AWS CDK documentation
3. Check CloudWatch logs for debugging
