import { Button } from '~/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ThumbnailPicker from './ThumbnailPicker';

interface MenuBarProps {
  templateTitle: string;
  onBackClick: () => void;
  templateId: string;
  thumbnailUrl: string | null;
}

export default function MenuBar({
  templateTitle,
  onBackClick,
  templateId,
  thumbnailUrl,
}: MenuBarProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBackClick}
              className="gap-2 hover:bg-muted/80 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Templates
            </Button>
            <div className="h-6 w-px bg-border" />
            <ThumbnailPicker
              templateId={templateId}
              thumbnailUrl={thumbnailUrl}
            />
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {templateTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                Imported video template
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
