import { useState } from "react";
import {
  ChefHat,
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  Utensils,
  QrCode,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCanteenAdmin } from "@/hooks/useCanteenAdmin";
import MenuManager from "./MenuManager";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Preparing", color: "bg-orange-100 text-orange-700" },
  ready: { label: "Ready", color: "bg-green-100 text-green-700" },
  collected: { label: "Collected", color: "bg-gray-100 text-gray-700" },
};

export default function CanteenAdminPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    orders,
    loading,
    updateOrderStatus,
    getOrderStats,
    getItemDemand,
    getSlotDistribution,
  } = useCanteenAdmin();

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const dashboardUser = {
    name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Canteen Admin",
    email: user?.email || "",
    role: "admin" as const,
    avatar: user?.user_metadata?.avatar_url,
  };

  const stats = getOrderStats();
  const itemDemand = getItemDemand();
  const slotDistribution = getSlotDistribution();

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout user={dashboardUser} onLogout={signOut}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Canteen Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage orders and track demand
            </p>
          </div>
          <Button onClick={() => navigate("/canteen/scanner")}>
            <QrCode className="h-4 w-4 mr-2" />
            Scan Orders
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={stats.total}
            icon={Utensils}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            title="Preparing"
            value={stats.preparing}
            icon={ChefHat}
            color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
          <StatCard
            title="Ready"
            value={stats.ready}
            icon={Package}
            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <StatCard
            title="Collected"
            value={stats.collected}
            icon={CheckCircle2}
            color="bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
          />
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Live Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="demand">Item Demand</TabsTrigger>
            <TabsTrigger value="slots">Slot Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No orders found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status];
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {order.order_number}
                              </span>
                              <Badge className={status?.color}>
                                {status?.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.student_profile?.full_name ||
                                order.student_profile?.email ||
                                "Student"}
                            </p>
                            <p className="text-sm">
                              {order.order_items
                                ?.map(
                                  (i) =>
                                    `${i.quantity}× ${i.menu_item?.name || "Item"}`
                                )
                                .join(", ")}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {order.time_slot?.slot_time}
                              </span>
                              <span className="font-medium text-foreground">
                                ₹{order.total_price}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {order.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateOrderStatus(order.id, "preparing")
                                }
                              >
                                <ChefHat className="h-4 w-4 mr-1" />
                                Start Prep
                              </Button>
                            )}
                            {order.status === "preparing" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus(order.id, "ready")
                                }
                              >
                                <Package className="h-4 w-4 mr-1" />
                                Mark Ready
                              </Button>
                            )}
                            {order.status === "ready" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  updateOrderStatus(order.id, "collected")
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Collected
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            {/* Menu management: list items and allow image upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Manage Menu Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* This component requires canteen admin hook to expose menuItems and upload helper */}
                {/* Lazy-load menu items from hook by calling refreshData from useCanteenAdmin if needed */}
                <MenuManager />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="demand" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Most Ordered Items Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                {itemDemand.length === 0 ? (
                  <p className="text-muted-foreground">No orders yet today</p>
                ) : (
                  <div className="space-y-4">
                    {itemDemand.slice(0, 10).map((item, index) => (
                      <div key={item.name} className="flex items-center gap-4">
                        <span className="w-6 text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground">
                              {item.count} orders
                            </span>
                          </div>
                          <Progress
                            value={
                              (item.count / (itemDemand[0]?.count || 1)) * 100
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Slot Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slotDistribution.length === 0 ? (
                  <p className="text-muted-foreground">
                    No time slots configured
                  </p>
                ) : (
                  <div className="space-y-4">
                    {slotDistribution.map((slot) => (
                      <div key={slot.slot}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{slot.slot}</span>
                          <span className="text-muted-foreground">
                            {slot.orders}/{slot.capacity} orders ({slot.percentage}%)
                          </span>
                        </div>
                        <Progress
                          value={slot.percentage}
                          className={
                            slot.percentage > 80
                              ? "[&>div]:bg-red-500"
                              : slot.percentage > 50
                              ? "[&>div]:bg-yellow-500"
                              : ""
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
