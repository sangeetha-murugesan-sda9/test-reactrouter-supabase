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
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by brand" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All brands</SelectItem>
        {brands.map(brand => (
          <SelectItem key={brand.id} value={brand.slug}>
            {brand.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
