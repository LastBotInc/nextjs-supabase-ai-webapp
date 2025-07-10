# Backend Architecture

## Overview
Innolease's backend architecture is designed to support comprehensive vehicle leasing and fleet management operations for B2B clients:

## Database
We use Supabase as our backend service, providing:
- PostgreSQL database with vehicle and contract data models
- Authentication with corporate account hierarchy
- Real-time fleet status updates
- Document storage for contracts and invoices
- Scheduled functions for maintenance alerts and reporting

### Authentication
Authentication is handled by Supabase Auth with the following features:
- Email/Password authentication for corporate accounts
- Role-based access (Admin, Fleet Manager, Driver, Service Provider)
- Company hierarchy with parent-child relationships
- Session management with enhanced security
- IP tracking for unusual login detection

### Database Schema
The schema is designed around vehicle leasing operations:
- Corporate profiles and hierarchy
- Vehicle inventory and details
- Leasing contracts and terms
- Maintenance records and scheduling
- Invoicing and financial tracking
- Service provider integration

### API Endpoints

#### Authentication & Corporate Access
- `/api/auth/*` - Authentication endpoints
- `/api/companies/*` - Company management
- `/api/users/*` - User management
- `/api/roles/*` - Role and permission management

#### Vehicle Management
- `/api/vehicles/*` - Vehicle inventory CRUD operations
- `/api/vehicle-status/*` - Real-time vehicle status updates
- `/api/vehicle-assignments/*` - Driver-vehicle assignments
- `/api/mileage-reports/*` - Vehicle mileage tracking
- `/api/vehicle-documents/*` - Vehicle documentation

#### Contract Management
- `/api/contracts/*` - Leasing contract operations
- `/api/contract-templates/*` - Contract template management
- `/api/contract-calculations/*` - Pricing and terms calculations
- `/api/contract-documents/*` - Contract document generation
- `/api/contract-renewals/*` - Contract renewal management

#### Maintenance & Services
- `/api/maintenance/*` - Maintenance record tracking
- `/api/service-requests/*` - Service request management
- `/api/service-providers/*` - Service partner integration
- `/api/maintenance-scheduling/*` - Maintenance scheduling
- `/api/inspection-reminders/*` - Vehicle inspection reminders

#### Financial Operations
- `/api/invoices/*` - Invoice generation and management
- `/api/payments/*` - Payment tracking
- `/api/financial-reports/*` - Financial reporting
- `/api/cost-analysis/*` - Fleet cost analysis
- `/api/budget-planning/*` - Budget and forecast planning

#### Reporting & Analytics
- `/api/fleet-analytics/*` - Fleet performance metrics
- `/api/emissions-reports/*` - Environmental impact reporting
- `/api/utilization-reports/*` - Vehicle utilization analysis
- `/api/cost-reports/*` - Cost breakdown reporting
- `/api/custom-reports/*` - Custom report generation

#### Document Management
- `/api/document-templates/*` - Document template management
- `/api/pdf-generation/*` - PDF document generation
- `/api/document-storage/*` - Secure document storage
- `/api/document-sharing/*` - Controlled document sharing

#### Internationalization
- `/api/translations/*` - Translation management (Finnish, Swedish, English)
- `/api/languages/*` - Language settings
- `/api/regional-settings/*` - Region-specific configurations

#### Notifications
- `/api/email-notifications/*` - Email notification system
- `/api/sms-notifications/*` - SMS alerts for critical events
- `/api/in-app-notifications/*` - Portal notification system
- `/api/maintenance-alerts/*` - Service due reminders

### Environment Variables
Required environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Notifications
SENDGRID_API_KEY=your-sendgrid-key
NOTIFICATION_FROM_EMAIL=notifications@innolease.fi

# SMS Notifications
SMS_PROVIDER_API_KEY=your-sms-provider-key

# PDF Generation
PDF_GENERATOR_API_KEY=your-pdf-generator-key

# Service Integrations
VIANOR_API_KEY=your-vianor-integration-key
EUROMASTER_API_KEY=your-euromaster-integration-key
KATSASTUS_API_KEY=your-inspection-integration-key

# Payment Processing
PAYMENT_GATEWAY_API_KEY=your-payment-gateway-key
```

## Integration Architecture
Innolease integrates with several external services:

1. Vehicle Data Services
   - Vehicle registration database
   - VIN lookup services
   - Technical specifications database
   - Market value estimation services

2. Maintenance Service Providers
   - Vianor integration for tire services
   - Euromaster integration for maintenance
   - A-Katsastus and K1-Katsastus for inspections
   - Service booking systems

3. Financial Services
   - Invoicing system
   - Payment processing
   - Credit checking services
   - Leasing calculation engines

4. Reporting Services
   - Fleet analytics
   - Emissions calculations
   - Cost optimization algorithms
   - Utilization analytics

5. Document Processing
   - PDF generation
   - Digital signing
   - Document storage
   - Template management

## Security Measures
- Row Level Security (RLS) policies for multi-tenant data isolation
- End-to-end encryption for sensitive documents
- Audit logging for all critical operations
- IP-based access restrictions for admin functions
- Two-factor authentication for sensitive operations
- Regular security audits and penetration testing
