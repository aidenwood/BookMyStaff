-- BookMyStaff Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extending Supabase auth.users)
-- This table stores additional user profile information
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ,
  user_metadata JSONB DEFAULT '{}',
  app_metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  website VARCHAR(255),
  logo_url VARCHAR(500),
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  business_hours JSONB DEFAULT '{}',
  integrations JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Business RLS policies
CREATE POLICY "Business owners can manage their businesses" ON public.businesses
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Staff can view their business" ON public.businesses
  FOR SELECT USING (
    id IN (
      SELECT business_id FROM public.staff_members 
      WHERE user_id = auth.uid()
    )
  );

-- Regions table
CREATE TABLE public.regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Regions RLS policies
CREATE POLICY "Business owners can manage regions" ON public.regions
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view business regions" ON public.regions
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM public.staff_members 
      WHERE user_id = auth.uid()
    )
  );

-- Staff Members table
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar VARCHAR(500),
  role VARCHAR(50) DEFAULT 'staff',
  regions JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Staff members RLS policies
CREATE POLICY "Business owners can manage staff" ON public.staff_members
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view own profile" ON public.staff_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can update own profile" ON public.staff_members
  FOR UPDATE USING (user_id = auth.uid());

-- Appointment Types (Services)
CREATE TABLE public.appointment_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60, -- in minutes
  price DECIMAL(10,2),
  color VARCHAR(7) DEFAULT '#10B981',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;

-- Appointment types RLS policies
CREATE POLICY "Business owners can manage appointment types" ON public.appointment_types
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view appointment types" ON public.appointment_types
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM public.staff_members 
      WHERE user_id = auth.uid()
    )
  );

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, email)
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers RLS policies
CREATE POLICY "Business owners can manage customers" ON public.customers
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view business customers" ON public.customers
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM public.staff_members 
      WHERE user_id = auth.uid()
    )
  );

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  appointment_type_id UUID REFERENCES public.appointment_types(id) ON DELETE SET NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER DEFAULT 60, -- in minutes
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  service_name VARCHAR(255) NOT NULL,
  service_price DECIMAL(10,2),
  location_type VARCHAR(50) DEFAULT 'customer_location', -- customer_location, business_location
  address TEXT,
  notes TEXT,
  internal_notes TEXT,
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings RLS policies
CREATE POLICY "Business owners can manage bookings" ON public.bookings
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view assigned bookings" ON public.bookings
  FOR SELECT USING (
    staff_id IN (
      SELECT id FROM public.staff_members WHERE user_id = auth.uid()
    )
    OR business_id IN (
      SELECT business_id FROM public.staff_members 
      WHERE user_id = auth.uid()
    )
  );

-- Availability Slots table
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB, -- weekly pattern, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, date, start_time, region_id)
);

-- Enable RLS
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Availability slots RLS policies
CREATE POLICY "Business owners can manage availability" ON public.availability_slots
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage own availability" ON public.availability_slots
  FOR ALL USING (
    staff_id IN (
      SELECT id FROM public.staff_members WHERE user_id = auth.uid()
    )
  );

-- Recurring Availability table
CREATE TABLE public.recurring_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0-6 (Sunday to Saturday)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week, start_time, region_id)
);

-- Enable RLS
ALTER TABLE public.recurring_availability ENABLE ROW LEVEL SECURITY;

-- Recurring availability RLS policies  
CREATE POLICY "Business owners can manage recurring availability" ON public.recurring_availability
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage own recurring availability" ON public.recurring_availability
  FOR ALL USING (
    staff_id IN (
      SELECT id FROM public.staff_members WHERE user_id = auth.uid()
    )
  );

-- Service Areas table
CREATE TABLE public.service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  postcodes TEXT[], -- Array of postcodes served
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

-- Service areas RLS policies
CREATE POLICY "Business owners can manage service areas" ON public.service_areas
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Staff Location Assignments table
CREATE TABLE public.staff_location_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
  service_area_id UUID REFERENCES public.service_areas(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, service_area_id)
);

-- Enable RLS
ALTER TABLE public.staff_location_assignments ENABLE ROW LEVEL SECURITY;

-- Staff location assignments RLS policies
CREATE POLICY "Business owners can manage staff assignments" ON public.staff_location_assignments
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Staff Location Schedules table
CREATE TABLE public.staff_location_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
  service_area_id UUID REFERENCES public.service_areas(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_bookings INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, service_area_id, date, start_time)
);

-- Enable RLS
ALTER TABLE public.staff_location_schedules ENABLE ROW LEVEL SECURITY;

-- Staff location schedules RLS policies
CREATE POLICY "Business owners can manage location schedules" ON public.staff_location_schedules
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Notification Configs table
CREATE TABLE public.notification_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  reminder_24h_enabled BOOLEAN DEFAULT true,
  reminder_2h_enabled BOOLEAN DEFAULT true,
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  sendgrid_api_key VARCHAR(500),
  twilio_account_sid VARCHAR(500),
  twilio_auth_token VARCHAR(500),
  twilio_phone_number VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id)
);

-- Enable RLS
ALTER TABLE public.notification_configs ENABLE ROW LEVEL SECURITY;

-- Notification configs RLS policies
CREATE POLICY "Business owners can manage notification config" ON public.notification_configs
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Notification Templates table
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- booking_confirmation, reminder_24h, reminder_2h, etc.
  channel VARCHAR(50) NOT NULL, -- email, sms, push
  subject VARCHAR(255),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Available template variables
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, type, channel)
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Notification templates RLS policies
CREATE POLICY "Business owners can manage notification templates" ON public.notification_templates
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Scheduled Notifications table
CREATE TABLE public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- booking_confirmation, reminder_24h, etc.
  channel VARCHAR(50) NOT NULL, -- email, sms, push
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  subject VARCHAR(255),
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Scheduled notifications RLS policies
CREATE POLICY "Business owners can view notifications" ON public.scheduled_notifications
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Legacy staff_availability table (for compatibility)
CREATE TABLE public.staff_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  region VARCHAR(255),
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, date, time, region)
);

-- Enable RLS
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;

-- Staff availability RLS policies
CREATE POLICY "Business owners can manage staff availability" ON public.staff_availability
  FOR ALL USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX idx_staff_members_business_id ON public.staff_members(business_id);
CREATE INDEX idx_staff_members_user_id ON public.staff_members(user_id);
CREATE INDEX idx_bookings_business_id ON public.bookings(business_id);
CREATE INDEX idx_bookings_staff_id ON public.bookings(staff_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_availability_slots_staff_date ON public.availability_slots(staff_id, date);
CREATE INDEX idx_recurring_availability_staff_day ON public.recurring_availability(staff_id, day_of_week);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_status ON public.scheduled_notifications(status);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON public.appointment_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON public.availability_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_availability_updated_at BEFORE UPDATE ON public.recurring_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_areas_updated_at BEFORE UPDATE ON public.service_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_location_schedules_updated_at BEFORE UPDATE ON public.staff_location_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_configs_updated_at BEFORE UPDATE ON public.notification_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_notifications_updated_at BEFORE UPDATE ON public.scheduled_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();