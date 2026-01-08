-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'main',
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  preparation_time_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_slots table
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  slot_time TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 30,
  current_orders INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.canteen_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'collected', 'cancelled')),
  qr_code TEXT,
  order_number TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  collected_at TIMESTAMP WITH TIME ZONE
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.canteen_orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_logs table for tracking status changes
CREATE TABLE public.order_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.canteen_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;

-- Create helper function for canteen admin check
CREATE OR REPLACE FUNCTION public.is_canteen_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'canteen_admin'
  )
$$;

-- Menu items policies (everyone can view, canteen admin can manage)
CREATE POLICY "Anyone can view menu items"
ON public.menu_items FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Canteen admin can insert menu items"
ON public.menu_items FOR INSERT TO authenticated
WITH CHECK (is_canteen_admin(auth.uid()));

CREATE POLICY "Canteen admin can update menu items"
ON public.menu_items FOR UPDATE TO authenticated
USING (is_canteen_admin(auth.uid()));

CREATE POLICY "Canteen admin can delete menu items"
ON public.menu_items FOR DELETE TO authenticated
USING (is_canteen_admin(auth.uid()));

-- Time slots policies
CREATE POLICY "Anyone can view time slots"
ON public.time_slots FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Canteen admin can insert time slots"
ON public.time_slots FOR INSERT TO authenticated
WITH CHECK (is_canteen_admin(auth.uid()));

CREATE POLICY "Canteen admin can update time slots"
ON public.time_slots FOR UPDATE TO authenticated
USING (is_canteen_admin(auth.uid()));

CREATE POLICY "Canteen admin can delete time slots"
ON public.time_slots FOR DELETE TO authenticated
USING (is_canteen_admin(auth.uid()));

-- Orders policies
CREATE POLICY "Students can view own orders"
ON public.canteen_orders FOR SELECT TO authenticated
USING (student_id = auth.uid() OR is_canteen_admin(auth.uid()));

CREATE POLICY "Students can create orders"
ON public.canteen_orders FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Canteen admin can update orders"
ON public.canteen_orders FOR UPDATE TO authenticated
USING (is_canteen_admin(auth.uid()) OR student_id = auth.uid());

-- Order items policies
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.canteen_orders
    WHERE canteen_orders.id = order_items.order_id
    AND (canteen_orders.student_id = auth.uid() OR is_canteen_admin(auth.uid()))
  )
);

CREATE POLICY "Students can create order items"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.canteen_orders
    WHERE canteen_orders.id = order_items.order_id
    AND canteen_orders.student_id = auth.uid()
  )
);

-- Order logs policies
CREATE POLICY "Users can view own order logs"
ON public.order_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.canteen_orders
    WHERE canteen_orders.id = order_logs.order_id
    AND (canteen_orders.student_id = auth.uid() OR is_canteen_admin(auth.uid()))
  )
);

CREATE POLICY "Canteen admin can create order logs"
ON public.order_logs FOR INSERT TO authenticated
WITH CHECK (is_canteen_admin(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_canteen_orders_updated_at
BEFORE UPDATE ON public.canteen_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment time slot orders
CREATE OR REPLACE FUNCTION public.increment_slot_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.time_slots
  SET current_orders = current_orders + 1
  WHERE id = NEW.time_slot_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_slot_on_order
AFTER INSERT ON public.canteen_orders
FOR EACH ROW
EXECUTE FUNCTION public.increment_slot_orders();

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category, is_available) VALUES
('Veg Biryani', 'Fragrant basmati rice with mixed vegetables and spices', 80.00, 'main', true),
('Chicken Biryani', 'Aromatic rice with tender chicken pieces', 120.00, 'main', true),
('Paneer Butter Masala', 'Creamy tomato curry with cottage cheese', 90.00, 'main', true),
('Dal Tadka', 'Yellow lentils tempered with spices', 50.00, 'main', true),
('Roti', 'Fresh whole wheat flatbread', 10.00, 'sides', true),
('Jeera Rice', 'Cumin flavored steamed rice', 40.00, 'sides', true),
('Samosa', 'Crispy pastry with spiced potato filling', 15.00, 'snacks', true),
('Cold Coffee', 'Chilled coffee with milk', 35.00, 'beverages', true),
('Masala Chai', 'Spiced Indian tea', 15.00, 'beverages', true),
('Gulab Jamun', 'Sweet milk dumplings in sugar syrup', 30.00, 'desserts', true);

-- Insert default time slots for today
INSERT INTO public.time_slots (slot_date, slot_time, start_time, end_time, capacity) VALUES
(CURRENT_DATE, '12:45 - 1:00 PM', '12:45:00', '13:00:00', 30),
(CURRENT_DATE, '1:00 - 1:15 PM', '13:00:00', '13:15:00', 30),
(CURRENT_DATE, '1:15 - 1:30 PM', '13:15:00', '13:30:00', 30),
(CURRENT_DATE, '1:30 - 1:45 PM', '13:30:00', '13:45:00', 25);