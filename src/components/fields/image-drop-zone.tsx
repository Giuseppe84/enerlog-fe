import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

type ImageDropzoneProps = {
  onFileSelected: (file: File) => void;
};

export function ImageDropzone({ onFileSelected }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    onFileSelected(files[0]);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        "border-2 border-dashed rounded-lg p-8 cursor-pointer",
        "transition-colors",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      )}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground text-center">
        Trascina un’immagine qui oppure <span className="text-primary font-medium">clicca per selezionarla</span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}