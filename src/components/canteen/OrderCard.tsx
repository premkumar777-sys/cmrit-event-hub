import { QRCodeSVG } from "qrcode.react";
import { Clock, CheckCircle2, ChefHat, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CanteenOrder } from "@/hooks/useCanteen";

interface OrderCardProps {
  order: CanteenOrder;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <CheckCircle2 className="h-4 w-4" /> },
  preparing: { label: "Preparing", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: <ChefHat className="h-4 w-4" /> },
  ready: { label: "Ready!", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: <Package className="h-4 w-4" /> },
  collected: { label: "Collected", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400", icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <Clock className="h-4 w-4" /> },
};

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.pending;
  const timeSlot = order.time_slot;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {order.order_number}
          </CardTitle>
          <Badge className={status.color}>
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>
        {timeSlot && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pickup: {timeSlot.slot_time}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}× {item.menu_item?.name || "Item"}
              </span>
              <span className="text-muted-foreground">
                ₹{item.unit_price * item.quantity}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-medium">Total: ₹{order.total_price}</span>
          
          {order.status !== "collected" && order.status !== "cancelled" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Show QR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Order {order.order_number}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      value={order.qr_code || order.id}
                      size={200}
                      level="H"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Show this QR code at the counter to collect your order
                  </p>
                  {timeSlot && (
                    <Badge variant="secondary" className="text-base">
                      Pickup: {timeSlot.slot_time}
                    </Badge>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
