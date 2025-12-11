-- BookMyStaff Database Schema - Part 2: Staff Tables
-- Run this second after Part 1

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

-- Add policies for customers and service areas to see staff
DROP POLICY IF EXISTS "Staff can view business customers" ON public.customers;
CREATE POLICY "Staff can view business customers" ON public.customers
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM public.staff_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Business owners can manage appointment types" ON public.appointment_types;
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

DROP POLICY IF EXISTS "Business owners can manage regions" ON public.regions;
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

DROP POLICY IF EXISTS "Business owners can manage their businesses" ON public.businesses;
CREATE POLICY "Business owners can manage their businesses" ON public.businesses
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Staff can view their business" ON public.businesses
  FOR SELECT USING (
    id IN (
      SELECT business_id FROM public.staff_members 
      WHERE user_id = auth.uid()
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

-- Create indexes
CREATE INDEX idx_staff_members_business_id ON public.staff_members(business_id);
CREATE INDEX idx_staff_members_user_id ON public.staff_members(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_location_schedules_updated_at BEFORE UPDATE ON public.staff_location_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();