import { useState } from "react";
import { Search, Utensils, Coffee, Cookie, IceCream } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuItemCard } from "@/components/canteen/MenuItemCard";
import { CartSheet } from "@/components/canteen/CartSheet";
import { OrderCard } from "@/components/canteen/OrderCard";
import { useCanteen } from "@/hooks/useCanteen";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

const categories = [
  { id: "all", label: "All", icon: Utensils },
  { id: "main", label: "Main", icon: Utensils },
  { id: "sides", label: "Sides", icon: Utensils },
  { id: "snacks", label: "Snacks", icon: Cookie },
  { id: "beverages", label: "Drinks", icon: Coffee },
  { id: "desserts", label: "Desserts", icon: IceCream },
];

export default function CanteenMenuPage() {
  const { user, signOut } = useAuth();
  const { primaryRole } = useUserRole();
  const {
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
  } = useCanteen();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const dashboardUser = {
    name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
    email: user?.email || "",
    role: primaryRole as "student" | "organizer" | "faculty" | "hod" | "admin",
    avatar: user?.user_metadata?.avatar_url,
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const activeOrders = orders.filter(
    (o) => o.status !== "collected" && o.status !== "cancelled"
  );

  return (
    <DashboardLayout user={dashboardUser} onLogout={signOut}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Canteen</h1>
          <p className="text-muted-foreground">
            Pre-order your lunch and skip the queue
          </p>
        </div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">Active Orders</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="h-10">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="px-3">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No items found
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                cartItem={cart.find((c) => c.id === item.id)}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}

        {/* Cart Sheet */}
        <CartSheet
          cart={cart}
          timeSlots={timeSlots}
          total={getCartTotal()}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClear={clearCart}
          onPlaceOrder={placeOrder}
        />
      </div>
    </DashboardLayout>
  );
}
