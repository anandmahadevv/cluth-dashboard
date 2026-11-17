"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, CheckCircle2, FileImage, Loader2, RefreshCw, Trash2, UploadCloud, AlertCircle } from "lucide-react";
import { prepareEvidence, PreparedEvidence } from "@/lib/image-evidence";

interface EvidenceUploadProps {
  value: string;
  onChange: (url: string) => void;
  onProcessingChange: (processing: boolean) => void;
  disabled?: boolean;
}
export function EvidenceUpload({ value, onChange, onProcessingChange, disabled = false }: EvidenceUploadProps) {
  const picker = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const request = useRef({ version: 0 });
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [metadata, setMetadata] = useState<PreparedEvidence | null>(null);

  useEffect(() => {
    onProcessingChange(false);
    const requests = request.current;
    return () => { requests.version++; };
  }, [onProcessingChange]);
  useEffect(() => { if (!value) setMetadata(null); }, [value]);

  const processFile = useCallback(async (file: File) => {
    if (disabled) return;
    const current = ++request.current.version;
    setError("");
    setProcessing(true);
    onProcessingChange(true);
    try {
      const prepared = await prepareEvidence(file);
      if (current !== request.current.version) return;
      onChange(prepared.url);
      setMetadata(prepared);
    } catch (error: unknown) {
      if (current === request.current.version) setError(error instanceof Error ? error.message : "Could not prepare this screenshot.");
    } finally {
      if (current === request.current.version) { setProcessing(false); onProcessingChange(false); }
    }
  }, [disabled, onChange, onProcessingChange]);

  useEffect(() => {
    const paste = (event: ClipboardEvent) => {
      if (disabled) return;
      const image = Array.from(event.clipboardData?.items || []).find(item => item.type.startsWith("image/"))?.getAsFile();
      if (image) { event.preventDefault(); void processFile(image); }
    };
    window.addEventListener("paste", paste);
    return () => window.removeEventListener("paste", paste);
  }, [disabled, processFile]);

  const remove = () => {
    request.current.version++;
    setProcessing(false);
    onProcessingChange(false);
    onChange("");
    setMetadata(null);
    setError("");
    if (picker.current) picker.current.value = "";
    if (camera.current) camera.current.value = "";
  };
  const changed = (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = "";
    if (file) void processFile(file);
  };
  return <section aria-label="Screenshot evidence" className="space-y-3">
    <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-[#48564d]">Screenshot evidence <span className="text-red-700" aria-label="required">*</span></span><span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${value && !processing ? "text-emerald-700" : "text-[#87938a]"}`} role="status" aria-live="polite">{processing ? <><Loader2 className="h-3 w-3 animate-spin" />Preparing…</> : value ? <><CheckCircle2 className="h-3 w-3" />Ready to submit</> : "Required"}</span></div>
    <input ref={picker} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose evidence screenshot" className="hidden" onChange={event => changed(event.currentTarget)} disabled={disabled} />
    <input ref={camera} type="file" accept="image/*" capture="environment" aria-label="Take evidence photo" className="hidden" onChange={event => changed(event.currentTarget)} disabled={disabled} />
    <div onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) void processFile(file); }}
      className={`relative overflow-hidden rounded-xl border ${dragging ? "border-[#b76b43] bg-[#fff0e6]" : value ? "border-[#dfe4db] bg-[#f7f8f4]" : "border-dashed border-[#c9d2c3] bg-[#fafbf8]"}`} aria-busy={processing}>
      {value ? <>
        <div className="flex min-h-32 items-center justify-center p-2"><Image src={value} alt="Attached match screenshot" width={metadata?.width || 1200} height={metadata?.height || 900} unoptimized className="max-h-64 w-full rounded-lg object-contain" /></div>
        <div className="flex items-start gap-2 border-t border-[#e4e8df] bg-white px-3 py-3"><FileImage className="mt-0.5 h-4 w-4 shrink-0 text-[#87938a]" /><div className="min-w-0"><p className="break-all text-[11px] font-semibold text-[#3f4b43]">{metadata?.name || "Match screenshot"}</p><p className="mt-1 text-[10px] text-[#87938a]">{metadata ? `${metadata.width} × ${metadata.height} · ${Math.max(1, Math.round(metadata.bytes / 1024))} KB · Optimized` : "Attached to this draft"}</p></div></div>
      </> : <div className="flex flex-col items-center px-4 py-7 text-center"><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5e9e0] bg-white text-[#7d8a7b]"><UploadCloud className="h-5 w-5" /></span><p className="text-xs font-semibold text-[#3f4b43]">Drop your scoreboard here</p><p className="mt-1.5 text-[10px] leading-relaxed text-[#87938a]">PNG, JPG or WebP · Up to 15 MB<br />You can also paste an image with Ctrl + V.</p></div>}
      {processing && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 text-xs font-semibold text-[#48564d]"><Loader2 className="h-6 w-6 animate-spin text-[#b76b43]" />Preparing screenshot…</div>}
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={disabled || processing} onClick={() => picker.current?.click()} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#d1d9ce] bg-white px-3 py-2 text-[11px] font-semibold text-[#48564d] transition hover:bg-[#f0f3ec] disabled:opacity-50">{value ? <RefreshCw className="h-3.5 w-3.5" /> : <UploadCloud className="h-3.5 w-3.5" />}{value ? "Replace screenshot" : "Choose screenshot"}</button>
      {value ? <button type="button" disabled={disabled} onClick={remove} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-[11px] font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />Remove</button> : <button type="button" disabled={disabled || processing} onClick={() => camera.current?.click()} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#d1d9ce] bg-white px-3 py-2 text-[11px] font-semibold text-[#48564d] disabled:opacity-50"><Camera className="h-3.5 w-3.5" />Camera</button>}
    </div>
    {error && <p role="alert" className="flex items-start gap-1.5 text-[11px] leading-relaxed text-red-700"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>}
    <p className="text-[10px] leading-relaxed text-[#87938a]">{value ? "Attached to this draft. Sent when you submit the match." : "Attach a readable screenshot showing the teams and final scores."}</p>
  </section>;
}
