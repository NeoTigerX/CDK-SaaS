# CDK SaaS Frontend Dashboard

A React + Material-UI dashboard for managing tenants and orders in the CDK SaaS platform.

## Features

- **Dashboard**: Overview with key metrics and statistics
- **Tenant Management**: Create, view, edit, and delete tenants
- **Order Management**: Create, view, edit, and delete orders
- **Responsive Design**: Works on desktop and mobile devices
- **Material-UI Components**: Modern, accessible UI components

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API endpoints:
```
REACT_APP_TENANT_API_URL=https://your-tenant-api-gateway-url
REACT_APP_ORDER_API_URL=https://your-order-api-gateway-url
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates a `build` folder with the production build.

## API Configuration

The frontend expects the following API endpoints:

### Tenant API
- `GET /tenants` - List all tenants
- `GET /tenants/{tenantId}` - Get tenant details
- `POST /tenants` - Create new tenant
- `PUT /tenants/{tenantId}` - Update tenant
- `DELETE /tenants/{tenantId}` - Delete tenant

### Order API
- `GET /orders` - List all orders
- `GET /orders/{orderId}` - Get order details
- `GET /orders?tenantId={tenantId}` - Get orders by tenant
- `POST /orders` - Create new order
- `PUT /orders/{orderId}` - Update order
- `DELETE /orders/{orderId}` - Delete order

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Main layout with navigation
│   ├── pages/
│   │   ├── Dashboard.tsx      # Dashboard overview
│   │   ├── TenantsPage.tsx     # Tenant management
│   │   ├── OrdersPage.tsx      # Order management
│   │   ├── TenantDetailsPage.tsx
│   │   └── OrderDetailsPage.tsx
│   ├── services/
│   │   └── api.ts             # API service layer
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── App.tsx                # Main app component
│   └── index.tsx              # App entry point
├── package.json
└── tsconfig.json
```

## Technologies Used

- **React 18**: Frontend framework
- **TypeScript**: Type safety
- **Material-UI**: UI component library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

## Development

The app uses React's development server with hot reloading. Any changes to the source code will automatically refresh the browser.

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Deployment

The frontend can be deployed to any static hosting service:

- **AWS S3 + CloudFront**
- **Vercel**
- **Netlify**
- **GitHub Pages**

Make sure to set the correct API URLs in your environment variables for production.
