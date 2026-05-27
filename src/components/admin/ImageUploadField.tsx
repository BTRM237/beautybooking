"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  className?: string;
};

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || "Không thể tải ảnh lên.");
  }

  return data.data.url as string;
}

function parseUrls(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ImageUploadField({ label, value, onChange, helper, className }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ảnh lên.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
      <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3 sm:grid-cols-[120px_1fr]">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-[#120d11]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-500" />
          )}
        </div>
        <div className="min-w-0 space-y-3">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="premium-input"
            placeholder="/uploads/2026-05/anh.jpg"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary min-h-10 px-4 text-xs disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Tải ảnh lên
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="btn-ghost min-h-10 px-4 text-xs text-rose-200">
                <Trash2 className="h-4 w-4" />
                Xoá ảnh
              </button>
            )}
          </div>
          {helper && <p className="text-xs leading-5 text-slate-500">{helper}</p>}
          {error && <p className="text-xs font-semibold text-rose-200">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export function MultiImageUploadField({ label, value, onChange, helper, className }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const urls = parseUrls(value);

  const appendUrl = (url: string) => {
    onChange([...urls, url].join(", "));
  };

  const handleFiles = async (files?: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadImage));
      onChange([...urls, ...uploaded].join(", "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ảnh lên.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
      <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
        {urls.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {urls.map((url) => (
              <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/8 bg-[#120d11]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Ảnh gallery" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(urls.filter((item) => item !== url).join(", "))}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-rose-100 opacity-0 transition group-hover:opacity-100"
                  aria-label="Xoá ảnh khỏi gallery"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="premium-input min-h-24 resize-none"
          placeholder="/uploads/2026-05/anh-1.jpg, /uploads/2026-05/anh-2.jpg"
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-secondary min-h-10 px-4 text-xs disabled:opacity-60">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Tải nhiều ảnh
          </button>
          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Dán URL ảnh");
              if (url) appendUrl(url.trim());
            }}
            className="btn-ghost min-h-10 px-4 text-xs"
          >
            Thêm URL
          </button>
        </div>
        <p className={cn("mt-2 text-xs leading-5 text-slate-500", !helper && "hidden")}>{helper}</p>
        {error && <p className="mt-2 text-xs font-semibold text-rose-200">{error}</p>}
      </div>
    </div>
  );
}
