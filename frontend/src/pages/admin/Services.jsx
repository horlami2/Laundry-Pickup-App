import { useState } from "react";
import { toast } from "sonner";
import { useFetch } from "@/hooks/useFetch";
import { useRequest } from "@/hooks/useRequest";
import { serviceService } from "@/services/serviceService";
import PageLoader from "@/components/PageLoader";
import EmptyState from "@/components/EmptyState";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { formatMoney } from "@/utils/format";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  pricingType: "per_item",
  unit: "item",
  price: "",
};

export default function AdminServices() {
  const { data, loading, refetch } = useFetch(
    () => serviceService.getAll(),
    [],
  );
  const { request, loading: saving } = useRequest();
  const { request: toggleReq, loading: toggling } = useRequest();
  const { request: deleteReq, loading: deleting } = useRequest();
  const { request: seedReq, loading: seeding } = useRequest();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);

  const services = data?.services || [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setOpen(true);
  }

  function openEdit(svc) {
    setEditing(svc);
    setForm({
      name: svc.name || "",
      description: svc.description || "",
      category: svc.category || "",
      pricingType: svc.pricingType || "per_item",
      unit: svc.unit || "item",
      price: svc.price ?? "",
    });
    setImageFile(null);
    setOpen(true);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function onPricingType(value) {
    update("pricingType", value);
    update("unit", value === "per_kg" ? "kg" : "item");
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      toast.error("Name, category and price are required");
      return;
    }
    if (!editing && !imageFile) {
      toast.error("Service image is required");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editing) {
        await request(() => serviceService.update(editing._id, fd));
        toast.success("Service updated");
      } else {
        await request(() => serviceService.create(fd));
        toast.success("Service created");
      }
      setOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleStatus(svc) {
    try {
      await toggleReq(() => serviceService.toggleStatus(svc._id));
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function addStarterCatalog() {
    try {
      const result = await seedReq(() => serviceService.addStarterCatalog());
      toast.success(result.message);
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function remove(svc) {
    if (!window.confirm(`Delete "${svc.name}"?`)) return;
    try {
      await deleteReq(() => serviceService.remove(svc._id));
      toast.success("Service deleted");
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) return <PageLoader label="Loading services…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold">
          Laundry Services
        </h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Service
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No services yet"
          description="Add suggested laundry services with prices and images, or create your own."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={addStarterCatalog} disabled={seeding}>
                {seeding ? "Adding services…" : "Add suggested services"}
              </Button>
              <Button variant="outline" onClick={openCreate}>
                <Plus className="w-4 h-4" /> New Service
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Card key={svc._id} className={svc.isActive ? "" : "opacity-60"}>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {svc.image?.url && (
                      <Image
                        src={svc.image.url}
                        alt={svc.name}
                        className="w-full h-full"
                        fittingType="fill"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {svc.category}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      {formatMoney(svc.price)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /{svc.unit}
                      </span>
                    </p>
                  </div>
                </div>
                {svc.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {svc.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={svc.isActive}
                      onCheckedChange={() => toggleStatus(svc)}
                      disabled={toggling}
                    />
                    <span className="text-xs text-muted-foreground">
                      {svc.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(svc)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(svc)}
                      disabled={deleting}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Service" : "New Service"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Pricing type</Label>
                <Select value={form.pricingType} onValueChange={onPricingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_item">Per item</SelectItem>
                    <SelectItem value="per_kg">Per kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Price (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Image {editing && "(leave empty to keep current)"}</Label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
