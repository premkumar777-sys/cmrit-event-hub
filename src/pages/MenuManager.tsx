import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCanteenAdmin } from "@/hooks/useCanteenAdmin";

export default function MenuManager() {
  const { menuItems, loading, refreshData, uploadMenuItemImage, updateMenuItem } = useCanteenAdmin() as any;
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleFileChange = (id: string, f?: FileList | null) => {
    setFiles((s) => ({ ...s, [id]: f?.[0] || null }));
  };

  const handleUpload = async (id: string) => {
    const file = files[id];
    if (!file) return;
    setUploading((s) => ({ ...s, [id]: true }));
    await uploadMenuItemImage(id, file);
    setUploading((s) => ({ ...s, [id]: false }));
    await refreshData();
  };

  if (loading) return <div>Loading menu...</div>;

  return (
    <div className="space-y-3">
      {menuItems.map((item: any) => (
        <Card key={item.id}>
          <CardContent className="flex items-center gap-4">
            <div className="w-20 h-20 rounded overflow-hidden bg-muted-foreground/10 flex items-center justify-center">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-sm text-muted-foreground px-2 text-center">No image</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium">{item.name}</div>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(item.id, e.target.files)}
                />
                <Button size="sm" onClick={() => handleUpload(item.id)} disabled={!files[item.id] || uploading[item.id]}>
                  {uploading[item.id] ? "Uploading..." : "Upload"}
                </Button>
                {item.image_url && (
                  <Button size="sm" variant="ghost" onClick={async () => { await updateMenuItem(item.id, { image_url: null }); await refreshData(); }}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
