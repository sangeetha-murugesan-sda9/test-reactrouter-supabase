import { Link, useFetcher, useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { Brand } from '~/types/global';

interface BrandDialogProps {
  brands: Brand[];
  teamSlug: string;
}

interface BrandActionData {
  error?: string;
}

export function BrandDialog({ brands, teamSlug }: BrandDialogProps) {
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<BrandActionData>();

  const dialog = searchParams.get('dialog');
  const brandId = searchParams.get('brandId');
  const isCreate = dialog === 'create';
  const isEdit = dialog === 'edit' && Boolean(brandId);
  const open = isCreate || isEdit;

  const editingBrand = isEdit
    ? brands.find(brand => brand.id === brandId)
    : undefined;

  const closeHref = `/${teamSlug}/brands`;
  const isSubmitting = fetcher.state !== 'idle';
  const error = fetcher.data?.error;

  if (isEdit && !editingBrand) {
    return (
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Brand not found</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground" role="alert">
            This brand does not exist or may have been deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" asChild>
              <Link to={closeHref}>Back to brands</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit brand' : 'Create brand'}</DialogTitle>
        </DialogHeader>

        <fetcher.Form method="post" className="space-y-4">
          <input
            type="hidden"
            name="intent"
            value={isEdit ? 'update' : 'create'}
          />
          {isEdit && editingBrand && (
            <input type="hidden" name="id" value={editingBrand.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={editingBrand?.name ?? ''}
              placeholder="Vio Ljusfabrik"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              required
              defaultValue={editingBrand?.slug ?? ''}
              placeholder="vio-ljusfabrik"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              name="logo_url"
              type="url"
              defaultValue={editingBrand?.logo_url ?? ''}
              placeholder="https://example.com/logo.png"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" asChild>
              <Link to={closeHref}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEdit
                  ? 'Save changes'
                  : 'Create brand'}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
