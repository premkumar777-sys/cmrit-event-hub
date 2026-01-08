import { useState } from "react";
import { QrCode, CheckCircle2, XCircle, Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCanteenAdmin } from "@/hooks/useCanteenAdmin";
import { useToast } from "@/hooks/use-toast";

interface ScanResult {
  success: boolean;
  message: string;
  order?: {
    orderNumber: string;
    items: string;
    total: number;
  };
}

export default function CanteenScannerPage() {
  const { orders, updateOrderStatus } = useCanteenAdmin();
  const { toast } = useToast();
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processOrder = async (orderNumber: string) => {
    setIsProcessing(true);
    setScanResult(null);

    // Find order by order number
    const order = orders.find(
      (o) =>
        o.order_number.toLowerCase() === orderNumber.toLowerCase() ||
        o.id === orderNumber
    );

    if (!order) {
      setScanResult({
        success: false,
        message: "Order not found. Please check the order number.",
      });
      setIsProcessing(false);
      return;
    }

    if (order.status === "collected") {
      setScanResult({
        success: false,
        message: "This order has already been collected.",
        order: {
          orderNumber: order.order_number,
          items:
            order.order_items
              ?.map((i) => `${i.quantity}× ${i.menu_item?.name}`)
              .join(", ") || "",
          total: order.total_price,
        },
      });
      setIsProcessing(false);
      return;
    }

    if (order.status !== "ready") {
      setScanResult({
        success: false,
        message: `Order is not ready yet. Current status: ${order.status}`,
        order: {
          orderNumber: order.order_number,
          items:
            order.order_items
              ?.map((i) => `${i.quantity}× ${i.menu_item?.name}`)
              .join(", ") || "",
          total: order.total_price,
        },
      });
      setIsProcessing(false);
      return;
    }

    // Mark as collected
    const success = await updateOrderStatus(order.id, "collected");

    if (success) {
      setScanResult({
        success: true,
        message: "Order collected successfully!",
        order: {
          orderNumber: order.order_number,
          items:
            order.order_items
              ?.map((i) => `${i.quantity}× ${i.menu_item?.name}`)
              .join(", ") || "",
          total: order.total_price,
        },
      });
    } else {
      setScanResult({
        success: false,
        message: "Failed to mark order as collected. Please try again.",
      });
    }

    setIsProcessing(false);
  };

  const handleManualEntry = () => {
    if (!manualCode.trim()) return;
    processOrder(manualCode.trim());
    setManualCode("");
  };

  // Ready orders for quick access
  const readyOrders = orders.filter((o) => o.status === "ready");

  return (
    <DashboardLayout role="canteen_admin">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Scanner</h1>
          <p className="text-muted-foreground">
            Scan QR codes or enter order numbers to mark pickups
          </p>
        </div>

        {/* Scanner Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scanner Placeholder */}
            <div className="aspect-square max-w-xs mx-auto bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center text-muted-foreground p-4">
                <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Camera scanner coming soon.
                  <br />
                  Use manual entry below.
                </p>
              </div>
            </div>

            {/* Manual Entry */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter order number (e.g., ORD-ABC123)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualEntry()}
              />
              <Button onClick={handleManualEntry} disabled={isProcessing}>
                <Search className="h-4 w-4 mr-1" />
                Find
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Card
            className={
              scanResult.success
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-red-500 bg-red-50 dark:bg-red-900/20"
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {scanResult.success ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold text-lg ${
                      scanResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {scanResult.message}
                  </p>
                  {scanResult.order && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Order:</span>{" "}
                        {scanResult.order.orderNumber}
                      </p>
                      <p>
                        <span className="font-medium">Items:</span>{" "}
                        {scanResult.order.items}
                      </p>
                      <p>
                        <span className="font-medium">Total:</span> ₹
                        {scanResult.order.total}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ready Orders Quick List */}
        {readyOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Orders Ready for Pickup ({readyOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.student_profile?.full_name ||
                          order.student_profile?.email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => processOrder(order.order_number)}
                      disabled={isProcessing}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Collect
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
