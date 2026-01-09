import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  preparation_time_minutes: number | null;
}

export interface TimeSlot {
  id: string;
  slot_date: string;
  slot_time: string;
  start_time: string;
  end_time: string;
  capacity: number;
  current_orders: number;
  is_active: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface CanteenOrder {
  id: string;
  student_id: string;
  time_slot_id: string;
  total_price: number;
  status: string;
  qr_code: string | null;
  order_number: string;
  notes: string | null;
  created_at: string;
  collected_at: string | null;
  time_slot?: TimeSlot;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  menu_item?: MenuItem;
}

export function useCanteen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [orders, setOrders] = useState<CanteenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("category", { ascending: true });

    if (error) {
      console.error("Error fetching menu items:", error);
      return;
    }

    // Resolve image URLs: if the stored value is already an absolute URL, use it.
    // Otherwise assume it's a path in Supabase Storage and attempt to build a public URL.
    const bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "public";
    const resolved = await Promise.all(
      (data || []).map(async (item: any) => {
        const image = item.image_url;
        if (!image) return item;
        // If it's already an absolute URL, keep it
        if (typeof image === "string" && image.startsWith("http")) {
          return item;
        }

        try {
          const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(image);
          // supabase client returns an object with publicUrl in data (v2)
          const publicUrl = (urlData && (urlData as any).publicUrl) || (urlData as any)?.public_url || null;
          return { ...item, image_url: publicUrl || image };
        } catch (e) {
          // If anything goes wrong, leave the original value so placeholder will show
          console.error("Error resolving storage url for", image, e);
          return item;
        }
      })
    );

    setMenuItems(resolved || []);
  };

  const fetchTimeSlots = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("slot_date", today)
      .eq("is_active", true)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching time slots:", error);
      return;
    }

    setTimeSlots(data || []);
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("canteen_orders")
      .select(`
        *,
        time_slot:time_slots(*),
        order_items(*, menu_item:menu_items(*))
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    setOrders(data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMenuItems(), fetchTimeSlots(), fetchOrders()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  // Real-time subscription for order status updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('canteen-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'canteen_orders',
          filter: `student_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedOrder = payload.new as CanteenOrder;
          const oldOrder = payload.old as CanteenOrder;

          // Update local state
          setOrders((prev) =>
            prev.map((order) =>
              order.id === updatedOrder.id
                ? { ...order, ...updatedOrder }
                : order
            )
          );

          // Show toast notification for status changes
          if (oldOrder.status !== updatedOrder.status) {
            if (updatedOrder.status === 'ready') {
              toast({
                title: "🍽️ Order Ready!",
                description: `Your order ${updatedOrder.order_number} is ready for pickup!`,
              });
            } else if (updatedOrder.status === 'preparing') {
              toast({
                title: "👨‍🍳 Order Being Prepared",
                description: `Your order ${updatedOrder.order_number} is being prepared.`,
              });
            } else if (updatedOrder.status === 'collected') {
              toast({
                title: "✅ Order Collected",
                description: `Order ${updatedOrder.order_number} has been collected. Enjoy!`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const placeOrder = async (timeSlotId: string, notes?: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order",
        variant: "destructive",
      });
      return null;
    }

    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return null;
    }

    // Check if slot is still available
    const slot = timeSlots.find((s) => s.id === timeSlotId);
    if (!slot || slot.current_orders >= slot.capacity) {
      toast({
        title: "Slot Full",
        description: "This time slot is no longer available. Please choose another.",
        variant: "destructive",
      });
      await fetchTimeSlots();
      return null;
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const totalPrice = getCartTotal();

    // Create QR code data
    const qrData = JSON.stringify({
      orderNumber,
      studentId: user.id,
      totalPrice,
      timeSlotId,
      items: cart.map((i) => ({ name: i.name, qty: i.quantity })),
    });

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("canteen_orders")
      .insert({
        student_id: user.id,
        time_slot_id: timeSlotId,
        total_price: totalPrice,
        order_number: orderNumber,
        qr_code: qrData,
        notes,
        status: "confirmed",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    // Create order items
    const orderItems = cart.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
    }

    toast({
      title: "Order Placed! 🎉",
      description: `Order ${orderNumber} confirmed for ${slot.slot_time}`,
    });

    clearCart();
    await Promise.all([fetchOrders(), fetchTimeSlots()]);

    return order;
  };

  return {
    menuItems,
    timeSlots,
    orders,
    loading,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    placeOrder,
    refreshData: async () => {
      await Promise.all([fetchMenuItems(), fetchTimeSlots(), fetchOrders()]);
    },
  };
}
