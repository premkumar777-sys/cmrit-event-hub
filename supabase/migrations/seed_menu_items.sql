-- Insert sample canteen menu items for CMRIT Events
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wealvlapketerctqixth/sql

INSERT INTO menu_items (name, description, price, category, image_url, available, preparation_time) VALUES
-- Breakfast Items
('Masala Dosa', 'Crispy dosa served with sambar and chutneys', 40, 'breakfast', 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400', true, 10),
('Idli Sambar', '4 soft idlis served with sambar and chutney', 30, 'breakfast', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400', true, 8),
('Poori Curry', '3 fluffy pooris with aloo curry', 35, 'breakfast', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', true, 12),
('Upma', 'Traditional South Indian upma with vegetables', 25, 'breakfast', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', true, 8),
('Pesarattu', 'Green moong dal dosa with ginger chutney', 35, 'breakfast', 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400', true, 12),

-- Lunch Items
('Veg Meals', 'Rice, sambar, rasam, curd, 2 curries, papad', 60, 'lunch', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', true, 15),
('Chicken Biryani', 'Hyderabadi style chicken dum biryani with raita', 120, 'lunch', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', true, 20),
('Veg Biryani', 'Fragrant vegetable biryani with raita', 80, 'lunch', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400', true, 18),
('Chapati Curry', '4 chapatis with dal and vegetable curry', 50, 'lunch', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', true, 12),
('Egg Rice', 'Fried rice with scrambled eggs', 55, 'lunch', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', true, 10),

-- Snacks
('Samosa (2 pcs)', 'Crispy samosas with chutney', 20, 'snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', true, 5),
('Veg Puff', 'Flaky pastry filled with spiced vegetables', 15, 'snacks', 'https://images.unsplash.com/photo-1625498542602-6fbc5f6a42e0?w=400', true, 5),
('Mirchi Bajji', 'Stuffed chilli fritters (4 pcs)', 25, 'snacks', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', true, 8),
('Punugulu', 'Crispy rice flour fritters with chutney', 20, 'snacks', 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400', true, 8),
('French Fries', 'Crispy golden fries with ketchup', 40, 'snacks', 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400', true, 8),

-- Beverages
('Tea', 'Hot masala chai', 10, 'beverages', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', true, 3),
('Coffee', 'Fresh filter coffee', 15, 'beverages', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400', true, 3),
('Mango Lassi', 'Creamy mango yogurt drink', 30, 'beverages', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', true, 5),
('Fresh Lime Soda', 'Refreshing lime soda (sweet/salt)', 20, 'beverages', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400', true, 3),
('Buttermilk', 'Spiced chaas/majjiga', 15, 'beverages', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', true, 3),

-- Desserts
('Gulab Jamun (2 pcs)', 'Soft milk dumplings in sugar syrup', 25, 'desserts', 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400', true, 5),
('Ice Cream Cup', 'Vanilla/Chocolate/Strawberry', 30, 'desserts', 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400', true, 2),
('Rasgulla (2 pcs)', 'Soft cottage cheese balls in syrup', 25, 'desserts', 'https://images.unsplash.com/photo-1605197788044-5a920085696c?w=400', true, 5);

-- Verify the insert
SELECT COUNT(*) as total_items FROM menu_items;
