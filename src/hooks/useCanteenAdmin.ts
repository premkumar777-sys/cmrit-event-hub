import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, TimeSlot, CanteenOrder } from "./useCanteen";

export interface OrderWithDetails extends CanteenOrder {
  student_profile?: {
    full_name: string | null;
    email: string;
  };
}

export function useCanteenAdmin() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      console.error("Error fetching menu items:", error);
      return;
    }

    setMenuItems(data || []);
  };

  const fetchTimeSlots = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("slot_date", today)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching time slots:", error);
      return;
    }

    setTimeSlots(data || []);
  };

  const fetchOrders = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("canteen_orders")
      .select(`
        *,
        time_slot:time_slots(*),
        order_items(*, menu_item:menu_items(*))
      `)
      .gte("created_at", `${today}T00:00:00`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    // Fetch student profiles separately
    const studentIds = [...new Set((data || []).map(o => o.student_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", studentIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const ordersWithProfiles = (data || []).map(order => ({
      ...order,
      student_profile: profileMap.get(order.student_id),
    }));

    setOrders(ordersWithProfiles);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMenuItems(), fetchTimeSlots(), fetchOrders()]);
      setLoading(false);
    };

    loadData();

    // Set up realtime subscription for orders
    const channel = supabase
      .channel("canteen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "canteen_orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("canteen_orders")
      .update({
        status,
        ...(status === "collected" ? { collected_at: new Date().toISOString() } : {}),
      })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Status Updated",
      description: `Order marked as ${status}`,
    });

    await fetchOrders();
    return true;
  };

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    const { error } = await supabase.from("menu_items").insert(item);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Item Added",
      description: `${item.name} added to menu`,
    });

    await fetchMenuItems();
    return true;
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const { error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
      return false;
    }

    await fetchMenuItems();
    return true;
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
      return false;
    }

    await fetchMenuItems();
    return true;
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      collected: orders.filter((o) => o.status === "collected").length,
    };
    return stats;
  };

  const getItemDemand = () => {
    const demand: Record<string, number> = {};
    orders.forEach((order) => {
      order.order_items?.forEach((item) => {
        const name = item.menu_item?.name || "Unknown";
        demand[name] = (demand[name] || 0) + item.quantity;
      });
    });
    return Object.entries(demand)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getSlotDistribution = () => {
    return timeSlots.map((slot) => ({
      slot: slot.slot_time,
      orders: slot.current_orders,
      capacity: slot.capacity,
      percentage: Math.round((slot.current_orders / slot.capacity) * 100),
    }));
  };

  return {
    menuItems,
    timeSlots,
    orders,
    loading,
    updateOrderStatus,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getOrderStats,
    getItemDemand,
    getSlotDistribution,
    refreshData: async () => {
      await Promise.all([fetchMenuItems(), fetchTimeSlots(), fetchOrders()]);
    },
  };
}
