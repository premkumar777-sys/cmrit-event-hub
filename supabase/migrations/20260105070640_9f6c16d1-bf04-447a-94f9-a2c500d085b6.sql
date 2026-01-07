-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'organizer', 'faculty', 'hod', 'admin');

-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'completed');

-- Create enum for department
CREATE TYPE public.department AS ENUM ('CSM', 'CSE', 'ECE', 'CSD', 'ISE', 'ME', 'CV');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  department department,
  attendance_percentage DECIMAL(5,2) DEFAULT 100.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  date DATE NOT NULL,
  time TIME,
  venue TEXT,
  department department,
  category TEXT,
  max_participants INTEGER,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status event_status DEFAULT 'draft',
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT now(),
  qr_code TEXT,
  UNIQUE (event_id, user_id)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  checked_in_by UUID REFERENCES auth.users(id),
  UNIQUE (event_id, user_id)
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  certificate_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Create permission_requests table for 75% attendance rule
CREATE TABLE public.permission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user has any elevated role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('organizer', 'faculty', 'hod', 'admin')
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- User roles policies (only admins can manage, users can view own)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Events policies
CREATE POLICY "Anyone can view approved events"
  ON public.events FOR SELECT TO authenticated
  USING (status = 'approved' OR status = 'completed' OR organizer_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Organizers can create events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update own events"
  ON public.events FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'hod') OR public.has_role(auth.uid(), 'admin'));

-- Registrations policies
CREATE POLICY "Users can view registrations"
  ON public.registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Users can register for events"
  ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own registrations"
  ON public.registrations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Attendance policies
CREATE POLICY "Users can view own attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can mark attendance"
  ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- Certificates policies
CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can issue certificates"
  ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

-- Permission requests policies
CREATE POLICY "Users can view own permission requests"
  ON public.permission_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'hod') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create permission requests"
  ON public.permission_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Faculty/HoD can update permission requests"
  ON public.permission_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'hod') OR public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();