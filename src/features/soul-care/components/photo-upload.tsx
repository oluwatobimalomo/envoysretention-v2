"use client";

import { useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function PhotoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("visit-photos").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("visit-photos").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative w-fit">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Visit photo" className="h-24 w-24 rounded-lg border object-cover" />
        <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-destructive text-white">
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:bg-accent">
      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
      <span className="text-[10px]">{uploading ? "Uploading…" : "Add photo"}</span>
      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </label>
  );
}
