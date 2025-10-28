import * as cdk from 'aws-cdk-lib';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { join } from 'path';
import { Construct } from 'constructs';

export class CdkSaaSStack extends cdk.Stack {
  public readonly apiGatewayUrl: string;
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB tables
    const tenantsTable = new Table(this, 'TenantsTable', {
      tableName: 'tenants',
      partitionKey: { name: 'tenantId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add GSI for tenant lookup by email
    tenantsTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: { name: 'email', type: AttributeType.STRING },
    });

    const ordersTable = new Table(this, 'OrdersTable', {
      tableName: 'orders',
      partitionKey: { name: 'orderId', type: AttributeType.STRING },
      sortKey: { name: 'tenantId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add GSI for orders by order
    ordersTable.addGlobalSecondaryIndex({
      indexName: 'orderId-index',
      partitionKey: { name: 'orderId', type: AttributeType.STRING },
    });

    // Add GSI for orders by tenant
    ordersTable.addGlobalSecondaryIndex({
      indexName: 'tenant-index',
      partitionKey: { name: 'tenantId', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
    });

    // Add GSI for orders by status
    ordersTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'status', type: AttributeType.STRING },
      sortKey: { name: 'createdAt', type: AttributeType.STRING },
    });

    // Create Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'saas-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      userPoolClientName: 'saas-client',
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          implicitCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
      },
    });

    // Create Lambda functions
    const tenantLambda = new NodejsFunction(this, 'TenantLambda', {
      runtime: Runtime.NODEJS_18_X,
      entry: join(__dirname, '..', 'src', 'lambdas', 'tenant.ts'),
      handler: 'handler',
      functionName: `tenant-lambda-function`,
      environment: {
        TENANTS_TABLE: tenantsTable.tableName,
        ORDERS_TABLE: ordersTable.tableName,
      },
      bundling: {
        forceDockerBundling: false, // 👈 disables Docker
        define: {},
        minify: true,
        externalModules: ['aws-sdk'],
      },
    });
    
    const orderLambda = new NodejsFunction(this, 'OrderLambda', {
      runtime: Runtime.NODEJS_18_X,
      entry: join(__dirname, '..', 'src', 'lambdas', 'order.ts'),
      handler: 'handler',
      functionName: `order-lambda-function`,
      environment: {
        TENANTS_TABLE: tenantsTable.tableName,
        ORDERS_TABLE: ordersTable.tableName,
      },
      bundling: {
        forceDockerBundling: false, // 👈 disables Docker
        define: {},
        minify: true,
        externalModules: ['aws-sdk'],
      },
    });

    // Grant permissions to Lambda functions
    tenantsTable.grantReadWriteData(tenantLambda);
    tenantsTable.grantReadWriteData(orderLambda);
    ordersTable.grantReadWriteData(tenantLambda);
    ordersTable.grantReadWriteData(orderLambda);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'SaaSApi', {
      restApiName: 'SaaS API',
      description: 'Multi-tenant SaaS API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
      },
    });

    // Create Cognito Authorizer
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
      authorizerName: 'CognitoAuthorizer',
    });

    // Tenant endpoints
    const tenantResource = api.root.addResource('tenants');
    tenantResource.addMethod('POST', new apigateway.LambdaIntegration(tenantLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    tenantResource.addMethod('GET', new apigateway.LambdaIntegration(tenantLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const tenantByIdResource = tenantResource.addResource('{tenantId}');
    tenantByIdResource.addMethod('GET', new apigateway.LambdaIntegration(tenantLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    tenantByIdResource.addMethod('PUT', new apigateway.LambdaIntegration(tenantLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    tenantByIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(tenantLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Order endpoints
    const orderResource = api.root.addResource('orders');
    orderResource.addMethod('POST', new apigateway.LambdaIntegration(orderLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    orderResource.addMethod('GET', new apigateway.LambdaIntegration(orderLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const orderByIdResource = orderResource.addResource('{orderId}');
    orderByIdResource.addMethod('GET', new apigateway.LambdaIntegration(orderLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    orderByIdResource.addMethod('PUT', new apigateway.LambdaIntegration(orderLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    orderByIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(orderLambda), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Health check endpoint (no auth required)
    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', new apigateway.LambdaIntegration(tenantLambda));

    // Outputs
    this.apiGatewayUrl = api.url;
    this.userPoolId = userPool.userPoolId;
    this.userPoolClientId = userPoolClient.userPoolClientId;

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'TenantsTableName', {
      value: tenantsTable.tableName,
      description: 'DynamoDB Tenants Table Name',
    });

    new cdk.CfnOutput(this, 'OrdersTableName', {
      value: ordersTable.tableName,
      description: 'DynamoDB Orders Table Name',
    });
  }
}
