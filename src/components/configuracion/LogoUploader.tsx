import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Loader2 } from "lucide-react";

interface LogoUploaderProps {
  currentLogoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}

export function LogoUploader({ currentLogoUrl, onLogoChange }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una imagen válida",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede superar los 2MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('empresa-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('empresa-assets')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onLogoChange(publicUrl);

      toast({
        title: "Logo subido",
        description: "El logo se ha subido correctamente. Recuerda guardar los cambios."
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error al subir",
        description: "No se pudo subir el logo. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    // Just clear the URL, don't delete from storage (in case it's being used elsewhere)
    setPreviewUrl(null);
    onLogoChange(null);
    toast({
      title: "Logo eliminado",
      description: "Recuerda guardar los cambios."
    });
  };

  return (
    <div className="space-y-4">
      <Label>Logo de la empresa</Label>
      
      <div className="flex items-start gap-6">
        {/* Preview */}
        <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Logo de la empresa" 
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Sin logo</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {previewUrl ? 'Cambiar logo' : 'Subir logo'}
              </>
            )}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveLogo}
              className="w-full text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar logo
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            Formatos: JPG, PNG, SVG. Máximo 2MB.
          </p>
        </div>
      </div>
    </div>
  );
}