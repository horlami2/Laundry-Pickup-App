import { Image } from "@/components/ui/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { formatMoney } from "@/utils/format";

const ITEMS = [
  {
    name: "Shirt",
    category: "Wash & Fold",
    description: "Everyday shirts, freshly washed and neatly folded.",
    price: 5000,
    unit: "item",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Gown",
    category: "Wash & Press",
    description: "Evening and casual gowns, cleaned and pressed to perfection.",
    price: 7000,
    unit: "item",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Complete Agbada",
    category: "Wash & Press",
    description: "Full agbada set, carefully cleaned and pressed.",
    price: 20000,
    unit: "set",
    image:
      "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Suit",
    category: "Dry Clean",
    description: "Two-piece suits, dry-cleaned and crisply pressed.",
    price: 15000,
    unit: "set",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Wedding Gown",
    category: "Dry Clean",
    description: "Delicate wedding gowns, gently dry-cleaned and preserved.",
    price: 25000,
    unit: "item",
    image:
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Jeans",
    category: "Wash & Fold",
    description: "Denim jeans, washed and folded with care.",
    price: 5000,
    unit: "item",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Bedsheet",
    category: "Wash & Fold",
    description: "Bedsheets, washed fresh and neatly folded.",
    price: 5000,
    unit: "item",
    image:
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=85",
  },
];

export default function PricingCatalog({ onSelect }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((item) => (
        <Card
          key={item.name}
          onClick={() => onSelect?.(item)}
          className="cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              className="absolute inset-0 w-full h-full"
              fittingType="fill"
            />
          </div>
          <CardContent className="p-4 space-y-2">
            <span className="text-xs font-medium text-primary">
              {item.category}
            </span>
            <h3 className="font-medium leading-tight">{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            <div className="flex items-center justify-between pt-2">
              <p className="font-semibold">
                {formatMoney(item.price)}
                <span className="text-xs font-normal text-muted-foreground">
                  /{item.unit}
                </span>
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Order <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
