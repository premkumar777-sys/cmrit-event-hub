import { useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CartItem, TimeSlot } from "@/hooks/useCanteen";

interface CartSheetProps {
  cart: CartItem[];
  timeSlots: TimeSlot[];
  total: number;
  onAdd: (item: CartItem) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
  onPlaceOrder: (slotId: string, notes?: string) => Promise<any>;
}

export function CartSheet({
  cart,
  timeSlots,
  total,
  onAdd,
  onRemove,
  onClear,
  onPlaceOrder,
}: CartSheetProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [open, setOpen] = useState(false);

  const availableSlots = timeSlots.filter((s) => s.current_orders < s.capacity);

  const handlePlaceOrder = async () => {
    if (!selectedSlot) return;
    
    setIsOrdering(true);
    const result = await onPlaceOrder(selectedSlot, notes || undefined);
    setIsOrdering(false);

    if (result) {
      setOpen(false);
      setSelectedSlot("");
      setNotes("");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 px-5 rounded-full shadow-lg z-50">
          <ShoppingCart className="h-5 w-5 mr-2" />
          <span className="font-medium">₹{total}</span>
          {cart.length > 0 && (
            <Badge className="ml-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Your Cart
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Your cart is empty
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 py-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => onRemove(item.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => onAdd(item)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-medium w-16 text-right">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4" />
                    Select Pickup Time
                  </Label>
                  <RadioGroup
                    value={selectedSlot}
                    onValueChange={setSelectedSlot}
                    className="grid gap-2"
                  >
                    {availableSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        No available time slots
                      </p>
                    ) : (
                      availableSlots.map((slot) => (
                        <Label
                          key={slot.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedSlot === slot.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={slot.id} />
                            <span className="font-medium">{slot.slot_time}</span>
                          </div>
                          <Badge variant="secondary">
                            {slot.capacity - slot.current_orders} spots left
                          </Badge>
                        </Label>
                      ))
                    )}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Special Instructions (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                    rows={2}
                  />
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="flex-col gap-3 sm:flex-col">
              <Separator />
              <div className="flex justify-between items-center w-full text-lg font-semibold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedSlot || isOrdering}
                onClick={handlePlaceOrder}
              >
                {isOrdering ? "Placing Order..." : "Place Order"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
