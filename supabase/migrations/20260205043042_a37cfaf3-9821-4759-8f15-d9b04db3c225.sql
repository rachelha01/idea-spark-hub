-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  country TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create regions table
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  country TEXT,
  population BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT UNIQUE,
  description TEXT,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  stock_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create metrics table for time-series data
CREATE TABLE public.metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(15, 2) NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Data tables policies (authenticated users can read all data)
CREATE POLICY "Authenticated users can read suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage suppliers" ON public.suppliers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read regions" ON public.regions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage regions" ON public.regions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read products" ON public.products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read metrics" ON public.metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage metrics" ON public.metrics
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for regions
INSERT INTO public.regions (name, code, country, population) VALUES
  ('Jakarta', 'JKT', 'Indonesia', 10560000),
  ('Surabaya', 'SBY', 'Indonesia', 2870000),
  ('Bandung', 'BDG', 'Indonesia', 2500000),
  ('Medan', 'MDN', 'Indonesia', 2200000),
  ('Semarang', 'SMG', 'Indonesia', 1700000);

-- Insert sample suppliers
INSERT INTO public.suppliers (name, category, contact_email, country, status) VALUES
  ('PharmaCorp Indonesia', 'Manufacturer', 'contact@pharmacorp.id', 'Indonesia', 'active'),
  ('MediSupply Co', 'Distributor', 'sales@medisupply.com', 'Singapore', 'active'),
  ('HealthChem Labs', 'Manufacturer', 'info@healthchem.id', 'Indonesia', 'active'),
  ('Global Pharma Dist', 'Distributor', 'orders@globalpharma.com', 'Malaysia', 'active'),
  ('BioMed Solutions', 'Manufacturer', 'contact@biomed.id', 'Indonesia', 'active');