"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

export function RegistrationQr({ url }: { url: string }) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const downloadPng = () => {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "envoys-first-timers-qr.png";
    a.click();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied.");
  };

  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border bg-card p-8 text-center">
      <div ref={canvasWrapRef} className="rounded-lg border bg-white p-4">
        <QRCodeCanvas value={url} size={220} level="M" />
      </div>
      <div>
        <p className="text-sm font-medium">Scan to register</p>
        <p className="mt-1 max-w-xs text-xs break-all text-muted-foreground">{url}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyLink}><Copy size={14} /> Copy link</Button>
        <Button size="sm" onClick={downloadPng}><Download size={14} /> Download PNG</Button>
      </div>
    </div>
  );
}
