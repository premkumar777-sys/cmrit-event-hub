import { Plus, Minus, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MenuItem, CartItem } from "@/hooks/useCanteen";

interface MenuItemCardProps {
  item: MenuItem;
  cartItem?: CartItem;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
}

const categoryColors: Record<string, string> = {
  main: "bg-primary/10 text-primary",
  sides: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  snacks: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  beverages: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  desserts: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export function MenuItemCard({ item, cartItem, onAdd, onRemove }: MenuItemCardProps) {
  const quantity = cartItem?.quantity || 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          {/* Image */}
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted-foreground/10 flex items-center justify-center">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
                <span className="text-xs mt-1 text-center px-1 line-clamp-2">{item.name}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{item.name}</h3>
              <Badge variant="secondary" className={categoryColors[item.category] || ""}>
                {item.category}
              </Badge>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary">₹{item.price}</span>
              {item.preparation_time_minutes && (
                <span className="text-xs text-muted-foreground">
                  ~{item.preparation_time_minutes} min
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quantity > 0 ? (
              <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-md"
                  onClick={() => onRemove(item.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center font-medium">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-md"
                  onClick={() => onAdd(item)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => onAdd(item)}
                className="rounded-lg"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
