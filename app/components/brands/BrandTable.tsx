import type { MouseEvent } from 'react';
import { Link, useFetcher } from 'react-router';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '~/components/ui/button';
import type { Brand } from '~/types/global';

interface BrandTableProps {
  brands: Brand[];
  teamSlug: string;
}

interface BrandActionData {
  error?: string;
}

function handleDeleteClick(
  event: MouseEvent<HTMLButtonElement>,
  brandName: string
) {
  if (
    !window.confirm(
      `Are you sure you want to delete "${brandName}"? This action cannot be undone.`
    )
  ) {
    event.preventDefault();
  }
}

export function BrandTable({ brands, teamSlug }: BrandTableProps) {
  const fetcher = useFetcher<BrandActionData>();
  const deletingId = fetcher.formData?.get('id');

  if (brands.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        No brands yet. Create your first brand to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              Logo
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-foreground">
              Slug
            </th>
            <th className="px-4 py-3 text-right font-medium text-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {brands.map(brand => (
            <tr key={brand.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-foreground">{brand.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{brand.slug}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/${teamSlug}/brands?dialog=edit&brandId=${brand.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                  </Button>

                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={brand.id} />
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      onClick={event => handleDeleteClick(event, brand.name)}
                      disabled={
                        fetcher.state !== 'idle' && deletingId === brand.id
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </fetcher.Form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {fetcher.data?.error && (
        <p className="border-t border-border px-4 py-3 text-sm text-destructive">
          {fetcher.data.error}
        </p>
      )}
    </div>
  );
}
