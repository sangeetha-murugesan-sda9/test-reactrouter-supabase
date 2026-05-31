import { useNavigate, useSearchParams } from 'react-router';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function handleSelectBrand(value: string) {
    const params = new URLSearchParams(searchParams);

    if (value === 'all') {
      params.delete('brand');
    } else {
      params.set('brand', value);
    }

    const query = params.toString();
    navigate(query ? `?${query}` : '.', { replace: true });
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