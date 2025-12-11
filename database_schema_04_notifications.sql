-- BookMyStaff Database Schema - Part 4: Notifications
-- Run this fourth and final after Parts 1, 2, and 3

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

-- Create indexes for better performance
CREATE INDEX idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_status ON public.scheduled_notifications(status);

-- Create triggers for updated_at
CREATE TRIGGER update_notification_configs_updated_at BEFORE UPDATE ON public.notification_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_notifications_updated_at BEFORE UPDATE ON public.scheduled_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();