import { Image } from "@/components/ui/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { formatMoney } from "@/utils/format";
import { useFetch } from "@/hooks/useFetch";
import { serviceService } from "@/services/serviceService";

export default function PricingCatalog({ onSelect }) {
  const { data, loading, error } = useFetch(
    () => serviceService.getActive(),
    [],
  );
  const services = data?.services || [];

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading services…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Unable to load services. {error.message}
      </p>
    );
  }

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No services are currently available.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card
          key={service._id}
          onClick={() => onSelect?.(service)}
          className="cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          {service.image?.url && (
            <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
              <Image
                src={service.image.url}
                alt={service.name}
                className="absolute inset-0 w-full h-full"
                fittingType="fill"
              />
            </div>
          )}
          <CardContent className="p-4 space-y-2">
            <span className="text-xs font-medium text-primary">
              {service.category}
            </span>
            <h3 className="font-medium leading-tight">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <p className="font-semibold">
                {formatMoney(service.price)}
                <span className="text-xs font-normal text-muted-foreground">
                  /{service.unit}
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
