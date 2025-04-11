# Data Model

## Database Schema

### Core Tables

#### Profiles
```sql
table: profiles
- id (uuid, primary key, references auth.users)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- first_name (text)
- last_name (text)
- email (text)
- phone (text)
- avatar_url (text)
- role (text) -- 'fleet_manager', 'driver', 'admin', 'service_provider'
- company_id (uuid, references companies)
- department (text)
- title (text)
- default_language (text)
- timezone (text)
- is_active (boolean)
```

#### Companies
```sql
table: companies
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- name (text)
- business_id (text) -- Finnish Y-tunnus
- billing_address (jsonb)
- shipping_address (jsonb)
- contact_person (text)
- contact_email (text)
- contact_phone (text)
- logo_url (text)
- industry (text)
- size (text) -- 'small', 'medium', 'large'
- contract_number (text)
- parent_company_id (uuid, references companies) -- For corporate hierarchies
- settings (jsonb) -- Company-specific settings
- is_active (boolean)
```

#### Vehicles
```sql
table: vehicles
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- registration_number (text) -- License plate
- vin (text) -- Vehicle Identification Number
- make (text)
- model (text)
- year (integer)
- color (text)
- fuel_type (text) -- 'petrol', 'diesel', 'hybrid', 'electric'
- transmission (text)
- mileage (integer)
- mileage_updated_at (timestamp with time zone)
- status (text) -- 'available', 'leased', 'maintenance', 'retired'
- category (text) -- 'passenger', 'utility', 'truck'
- features (jsonb)
- technical_data (jsonb)
- images (jsonb)
- company_id (uuid, references companies)
- current_driver_id (uuid, references profiles)
- purchase_date (date)
- purchase_price (numeric)
- residual_value (numeric)
- co2_emissions (numeric)
- next_inspection_date (date)
```

#### Contracts
```sql
table: contracts
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- contract_number (text)
- company_id (uuid, references companies)
- vehicle_id (uuid, references vehicles)
- start_date (date)
- end_date (date)
- contract_type (text) -- 'financial_leasing', 'flexible_leasing', 'maintenance_leasing', 'mini_leasing'
- monthly_price (numeric)
- included_services (jsonb) -- Array of included services
- max_mileage (integer) -- Maximum allowed mileage, null if unlimited
- actual_mileage (integer) -- Current mileage
- status (text) -- 'draft', 'active', 'expired', 'terminated'
- termination_date (date)
- termination_reason (text)
- contract_document_url (text)
- terms_and_conditions (text)
- created_by (uuid, references auth.users)
- assigned_fleet_manager (uuid, references profiles)
- contract_notes (text)
- payment_terms (jsonb)
- optional_services (jsonb)
```

#### Maintenance Records
```sql
table: maintenance_records
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- vehicle_id (uuid, references vehicles)
- service_date (date)
- service_provider (text) -- 'vianor', 'euromaster', 'other'
- service_location (text)
- service_type (text) -- 'regular_maintenance', 'tire_change', 'repair', 'inspection'
- description (text)
- cost (numeric)
- invoice_number (text)
- mileage_at_service (integer)
- parts_replaced (jsonb)
- warranty_claim (boolean)
- performed_by (text)
- approved_by (uuid, references profiles)
- documents (jsonb) -- URLs to related documents
- next_service_date (date)
- next_service_mileage (integer)
- status (text) -- 'scheduled', 'in_progress', 'completed', 'cancelled'
```

#### Service Requests
```sql
table: service_requests
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- vehicle_id (uuid, references vehicles)
- requested_by (uuid, references profiles)
- service_type (text) -- 'maintenance', 'tire_change', 'repair', 'inspection'
- description (text)
- urgency (text) -- 'low', 'medium', 'high', 'critical'
- preferred_date (date)
- preferred_location (text)
- status (text) -- 'pending', 'approved', 'scheduled', 'completed', 'declined'
- approved_by (uuid, references profiles)
- scheduled_date (date)
- service_provider (text)
- completion_notes (text)
- invoice_amount (numeric)
- maintenance_record_id (uuid, references maintenance_records)
```

### Internationalization

#### Languages
```sql
table: languages
- id (text, primary key) -- 'fi', 'sv', 'en'
- created_at (timestamp with time zone)
- name (text)
- native_name (text)
- enabled (boolean)
- default (boolean)
```

#### Translations
```sql
table: translations
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- language_id (text, references languages)
- namespace (text)
- key (text)
- value (text)
- status (text)
```

### Analytics

#### Fleet Analytics
```sql
table: fleet_analytics
- id (uuid, primary key)
- created_at (timestamp with time zone)
- company_id (uuid, references companies)
- period_start (date)
- period_end (date)
- total_vehicles (integer)
- active_leases (integer)
- total_costs (numeric)
- maintenance_costs (numeric)
- fuel_costs (numeric)
- average_cost_per_vehicle (numeric)
- co2_emissions (numeric)
- total_mileage (integer)
- electric_vehicle_percentage (numeric)
- vehicle_utilization_rate (numeric)
- maintenance_frequency (numeric)
- report_url (text)
```

### Invoicing

#### Invoices
```sql
table: invoices
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- invoice_number (text)
- company_id (uuid, references companies)
- billing_period_start (date)
- billing_period_end (date)
- due_date (date)
- total_amount (numeric)
- status (text) -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
- payment_date (date)
- invoice_pdf_url (text)
- line_items (jsonb)
- payment_terms (text)
- notes (text)
```

#### Invoice Line Items
```sql
table: invoice_line_items
- id (uuid, primary key)
- created_at (timestamp with time zone)
- invoice_id (uuid, references invoices)
- contract_id (uuid, references contracts)
- vehicle_id (uuid, references vehicles)
- description (text)
- quantity (numeric)
- unit_price (numeric)
- total_price (numeric)
- tax_rate (numeric)
- tax_amount (numeric)
- item_type (text) -- 'lease_payment', 'maintenance', 'extra_services', 'penalty'
```

### Documents

#### Document Templates
```sql
table: document_templates
- id (uuid, primary key)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- name (text)
- description (text)
- template_type (text) -- 'contract', 'invoice', 'report'
- content (text)
- variables (jsonb)
- language_id (text, references languages)
- is_active (boolean)
```

#### Company Documents
```sql
table: company_documents
- id (uuid, primary key)
- created_at (timestamp with time zone)
- company_id (uuid, references companies)
- document_type (text) -- 'contract', 'invoice', 'report', 'other'
- name (text)
- description (text)
- file_url (text)
- uploaded_by (uuid, references profiles)
- expiration_date (date)
- is_confidential (boolean)
```

## Row Level Security Policies

### Vehicles
- Companies can only view their own vehicles
- Admins can view and manage all vehicles
- Drivers can only view vehicles assigned to them
- Fleet managers can view all vehicles in their company

### Contracts
- Companies can only view their own contracts
- Admins can view and manage all contracts
- Only fleet managers and admins can create/update contracts

### Maintenance Records
- Companies can only view records for their vehicles
- Service providers can view records they've created
- Admins can view and manage all maintenance records

### Service Requests
- Companies can only create/view requests for their vehicles
- Drivers can only create/view requests for vehicles assigned to them
- Fleet managers can manage all requests for their company
- Admins can view and manage all service requests

### Invoices
- Companies can only view their own invoices
- Admins can view and manage all invoices
- Only admins can create/update invoices

## Real-time Enabled Tables
- vehicles (for real-time status updates)
- service_requests (for real-time notifications)
- maintenance_records (for service tracking)
- fleet_analytics (for dashboard updates)

## Functions and Triggers
- update_updated_at(): Updates updated_at timestamp
- handle_new_user(): Creates profile for new users
- calculate_contract_costs(): Updates contract costs based on services
- check_vehicle_maintenance(): Checks if vehicle needs maintenance
- create_invoice_automatically(): Creates monthly invoices for active contracts
- update_mileage_report(): Updates mileage reports based on driver input
- recalculate_fleet_analytics(): Updates analytics when vehicle data changes

## Indexes
- vehicles(registration_number)
- vehicles(vin)
- contracts(contract_number)
- contracts(company_id, status)
- maintenance_records(vehicle_id, service_date)
- invoices(company_id, status)
- service_requests(vehicle_id, status)

## Core Types

### Vehicle Details
```typescript
interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vin: string;
  color: string;
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic';
  category: 'passenger' | 'utility' | 'truck';
  features: string[];
  technicalData: {
    engineSize: number;
    power: number;
    torque: number;
    batteryCapacity?: number;
    range?: number;
    co2Emissions: number;
  };
  images: {
    main: string;
    thumbnail: string;
    gallery: string[];
  };
}

interface LeaseContract {
  contractNumber: string;
  contractType: 'financial_leasing' | 'flexible_leasing' | 'maintenance_leasing' | 'mini_leasing';
  startDate: Date;
  endDate: Date;
  monthlyPrice: number;
  includedServices: string[];
  maxMileage: number | null;
  paymentTerms: {
    firstPaymentDate: Date;
    paymentDayOfMonth: number;
    paymentMethod: string;
  };
  optionalServices: {
    name: string;
    price: number;
    included: boolean;
  }[];
}
```
