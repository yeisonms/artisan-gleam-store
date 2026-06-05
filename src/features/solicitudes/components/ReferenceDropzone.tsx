import React, { useState, useRef } from 'react';
import { UploadCloud, X, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferenceDropzoneProps {
  onFilesChange: (urls: string[]) => void;
  onLinksChange: (links: string) => void;
  linksValue: string;
  error?: string;
}

export const ReferenceDropzone: React.FC<ReferenceDropzoneProps> = ({
  onFilesChange,
  onLinksChange,
  linksValue,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    const newUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('custom_requests')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Error al subir ${file.name}`);
        console.error(uploadError);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('custom_requests')
          .getPublicUrl(filePath);
        
        newUrls.push(publicUrlData.publicUrl);
      }
    }
    
    if (newUrls.length > 0) {
      const updatedUrls = [...uploadedUrls, ...newUrls];
      setUploadedUrls(updatedUrls);
      onFilesChange(updatedUrls);
      toast.success(`${newUrls.length} imagen(es) subida(s)`);
    }
    setUploading(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updated = [...uploadedUrls];
    updated.splice(index, 1);
    setUploadedUrls(updated);
    onFilesChange(updated);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full">
        <label className="text-xs tracking-[0.1em] text-muted-foreground uppercase mb-2 font-sans block">
          Imágenes de Referencia (Opcional)
        </label>
        <div
          className={`relative border border-dashed rounded-sm p-8 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
            isDragging ? 'border-gold bg-gold/5' : 'border-border/60 hover:border-gold/50 bg-[#FAFAFA] hover:bg-white'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <UploadCloud className={`w-8 h-8 mb-3 transition-colors ${isDragging ? 'text-gold' : 'text-muted-foreground/40'}`} strokeWidth={1.5} />
          <p className="text-sm text-foreground font-medium mb-1">
            {uploading ? 'Subiendo...' : 'Haz clic o arrastra imágenes aquí'}
          </p>
          <p className="text-xs text-muted-foreground font-light">PNG, JPG, WEBP hasta 5MB</p>
        </div>

        {uploadedUrls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {uploadedUrls.map((url, i) => (
              <div key={i} className="relative group w-20 h-20 rounded-sm overflow-hidden border border-border shadow-sm">
                <img src={url} alt={`Referencia ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full">
        <label className="text-xs tracking-[0.1em] text-muted-foreground uppercase mb-2 font-sans flex items-center gap-2">
          <LinkIcon size={14} className="text-muted-foreground/60" />
          Enlaces de Referencia (Opcional)
        </label>
        <textarea
          className={`w-full px-4 py-3 bg-[#FAFAFA] border border-border/60 rounded-sm text-foreground text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 focus:bg-white transition-all duration-300 placeholder:text-muted-foreground/40 resize-none h-20 ${
            error ? 'border-destructive focus:border-destructive focus:ring-destructive/30' : ''
          }`}
          placeholder="Ej: https://pinterest.com/..."
          value={linksValue}
          onChange={(e) => onLinksChange(e.target.value)}
        />
        {error && <span className="text-destructive text-[11px] mt-1.5 uppercase tracking-wider block">{error}</span>}
      </div>
    </div>
  );
};
