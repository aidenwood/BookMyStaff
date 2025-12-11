-- BookMyStaff Database Schema - Part 3: Bookings and Availability
-- Run this third after Parts 1 and 2

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

-- Create indexes for better performance
CREATE INDEX idx_bookings_business_id ON public.bookings(business_id);
CREATE INDEX idx_bookings_staff_id ON public.bookings(staff_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_availability_slots_staff_date ON public.availability_slots(staff_id, date);
CREATE INDEX idx_recurring_availability_staff_day ON public.recurring_availability(staff_id, day_of_week);

-- Create triggers for updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON public.availability_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_availability_updated_at BEFORE UPDATE ON public.recurring_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();