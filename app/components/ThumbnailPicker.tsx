import { useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '~/services/supabase.client';

interface ThumbnailPickerProps {
  templateId: string;
  thumbnailUrl: string | null;
}

export default function ThumbnailPicker({
  templateId,
  thumbnailUrl: previewUrl,
}: ThumbnailPickerProps) {
  const [preview, setPreview] = useState<string | null>(
    previewUrl ? previewUrl : null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      uploadToBucket(file, templateId);
    }
  };
  const uploadToBucket = async (file: File, templateId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error: imageError } = await supabase.storage
      .from('thumbnails')
      .upload(`${templateId}/${file.name}`, file, {
        // Replace existing file if a file with the same name is uplaoded to the bucket
        upsert: true,
      });
    if (imageError) {
      throw imageError;
    }

    const { data: url } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(`${templateId}/${file.name}`);
    const { error } = await supabase
      .from('templates')
      .update({
        thumbnail_url: url.publicUrl,
      })
      .eq('id', templateId);
    if (error) {
      throw error;
    }
  };

  const removeThumbnail = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from('templates')
      .update({ thumbnail_url: '/default-thumbnail.svg' })
      .eq('id', templateId);
    setPreview(null);
  };

  const openFilePicker = () => {
    if (fileInputRef.current && !preview) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div
        className={`w-14 h-full aspect-square bg-muted rounded-md shadow hover:bg-muted/90 ${preview ? '' : 'hover:cursor-pointer'}`}
        onClick={openFilePicker}
      >
        {preview && (
          <div className="relative aspect-square h-full">
            <img
              src={preview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover "
            />

            <button
              className="absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-all transition-200 text-xs hover:cursor-pointer"
              onClick={removeThumbnail}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
