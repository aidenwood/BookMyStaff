-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE staff_role AS ENUM ('staff', 'admin', 'owner');
CREATE TYPE integration_type AS ENUM ('pipedrive', 'hubspot', 'salesforce', 'zapier', 'email', 'none');

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    website TEXT,
    description TEXT,
    logo TEXT,
    owner_id UUID NOT NULL,
    industry_id TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    integrations JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regions table
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4ECDC4',
    postcodes TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    travel_time INTEGER, -- in minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff members table
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role staff_role DEFAULT 'staff',
    regions TEXT[] DEFAULT '{}',
    avatar TEXT,
    bio TEXT,
    skills TEXT[],
    rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment types table
CREATE TABLE appointment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60, -- in minutes
    price DECIMAL(10,2),
    description TEXT,
    color TEXT DEFAULT '#4ECDC4',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    customer_postcode TEXT,
    staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    appointment_type_id UUID NOT NULL REFERENCES appointment_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    status booking_status DEFAULT 'pending',
    notes TEXT,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    confirmation_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability slots table
CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, date, start_time, region_id)
);

-- Recurring availability table
CREATE TABLE recurring_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    regions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auth users table (extends Supabase auth)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    role staff_role DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_regions_business_id ON regions(business_id);
CREATE INDEX idx_staff_members_business_id ON staff_members(business_id);
CREATE INDEX idx_staff_members_email ON staff_members(email);
CREATE INDEX idx_appointment_types_business_id ON appointment_types(business_id);
CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_confirmation_code ON bookings(confirmation_code);
CREATE INDEX idx_availability_slots_staff_id ON availability_slots(staff_id);
CREATE INDEX idx_availability_slots_date ON availability_slots(date);
CREATE INDEX idx_recurring_availability_staff_id ON recurring_availability(staff_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON appointment_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON availability_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_availability_updated_at BEFORE UPDATE ON recurring_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own businesses" ON businesses
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own businesses" ON businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own businesses" ON businesses
    FOR UPDATE USING (auth.uid() = owner_id);

-- Staff members
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view staff" ON staff_members
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
            UNION
            SELECT business_id FROM staff_members WHERE id = auth.uid()
        )
    );

CREATE POLICY "Business owners can manage staff" ON staff_members
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );

-- Regions
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view regions" ON regions
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
            UNION
            SELECT business_id FROM staff_members WHERE id = auth.uid()
        )
    );

CREATE POLICY "Business owners can manage regions" ON regions
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view bookings" ON bookings
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
            UNION
            SELECT business_id FROM staff_members WHERE id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Business members can update bookings" ON bookings
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
            UNION
            SELECT business_id FROM staff_members WHERE id = auth.uid()
        )
    );

-- Availability
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can view availability" ON availability_slots
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
            UNION
            SELECT business_id FROM staff_members WHERE id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage their own availability" ON availability_slots
    FOR ALL USING (staff_id = auth.uid());

-- Functions for booking management
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
BEGIN
    RETURN upper(substr(md5(random()::text), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Function to get available slots for a region and date
CREATE OR REPLACE FUNCTION get_available_slots(
    p_business_id UUID,
    p_region_id UUID,
    p_date DATE,
    p_duration INTEGER DEFAULT 60
)
RETURNS TABLE(
    slot_time TIME,
    staff_id UUID,
    staff_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH available_staff AS (
        SELECT sm.id, sm.name
        FROM staff_members sm
        WHERE sm.business_id = p_business_id
        AND sm.is_active = true
        AND p_region_id = ANY(sm.regions::UUID[])
    ),
    time_slots AS (
        SELECT generate_series(
            '09:00'::TIME,
            '17:00'::TIME,
            INTERVAL '1 hour'
        ) AS slot_time
    ),
    booked_slots AS (
        SELECT b.time, b.staff_id
        FROM bookings b
        WHERE b.business_id = p_business_id
        AND b.date = p_date
        AND b.status NOT IN ('cancelled', 'no_show')
    )
    SELECT 
        ts.slot_time,
        ast.id AS staff_id,
        ast.name AS staff_name
    FROM time_slots ts
    CROSS JOIN available_staff ast
    LEFT JOIN booked_slots bs ON bs.time = ts.slot_time AND bs.staff_id = ast.id
    WHERE bs.staff_id IS NULL
    ORDER BY ts.slot_time, ast.name;
END;
$$ LANGUAGE plpgsql;

-- Real-time subscriptions setup
ALTER publication supabase_realtime ADD TABLE bookings;
ALTER publication supabase_realtime ADD TABLE availability_slots;
ALTER publication supabase_realtime ADD TABLE staff_members;