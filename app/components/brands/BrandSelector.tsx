import { Tag } from 'lucide-react';
import { useSearchParams } from 'react-router';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { BrandSummary } from '~/types/global';

interface BrandSelectorProps {
  brands: BrandSummary[];
  selectedBrandSlug: string | null;
}

const brandItemClassName =
  'font-semibold text-foreground focus:bg-destructive focus:text-primary-foreground data-[highlighted]:bg-destructive data-[highlighted]:text-primary-foreground';

function getTriggerLabel(
  brands: BrandSummary[],
  selectedBrandSlug: string | null
): string {
  if (!selectedBrandSlug) {
    return 'All Brands';
  }

  return (
    brands.find(brand => brand.slug === selectedBrandSlug)?.name ?? 'All Brands'
  );
}

export function BrandSelector({
  brands,
  selectedBrandSlug,
}: BrandSelectorProps) {
  const [, setSearchParams] = useSearchParams();

  function handleSelectBrand(value: string) {
    setSearchParams(
      prev => {
        const next: Record<string, string> = {};
        prev.forEach((paramValue, key) => {
          if (key !== 'brand') {
            next[key] = paramValue;
          }
        });
        if (value !== 'all') {
          next.brand = value;
        }
        return next;
      },
      { replace: true }
    );
  }

  return (
    <Select
      value={selectedBrandSlug ?? 'all'}
      onValueChange={handleSelectBrand}
    >
      <SelectTrigger className="h-10 min-w-[160px] gap-2 rounded-lg border-border bg-background px-4 font-semibold text-foreground shadow-sm *:data-[slot=select-value]:text-foreground">
        <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue>{getTriggerLabel(brands, selectedBrandSlug)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-lg">
        <SelectItem value="all" className={brandItemClassName}>
          All Brands
        </SelectItem>
        {brands.map(brand => (
          <SelectItem
            key={brand.id}
            value={brand.slug}
            className={brandItemClassName}
          >
            {brand.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
