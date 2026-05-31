"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { TOOLS, getRelatedTools } from "@/lib/tools-config";
import { AlertCircle, ImageIcon, MapPin } from "lucide-react";
import exifr from "exifr";

const tool = TOOLS.find((t) => t.slug === "image-metadata")!;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatExposure(val: unknown): string {
  if (typeof val === "number") {
    if (val < 1) return `1/${Math.round(1 / val)}s`;
    return `${val}s`;
  }
  return String(val);
}

function formatFNumber(val: unknown): string {
  if (typeof val === "number") return `f/${val.toFixed(1)}`;
  return String(val);
}

function formatFocalLength(val: unknown): string {
  if (typeof val === "number") return `${val.toFixed(0)}mm`;
  return String(val);
}

function formatDate(val: unknown): string {
  if (val instanceof Date) return val.toLocaleString();
  if (typeof val === "string") return val;
  return String(val);
}

interface MetaRow {
  label: string;
  value: string;
}

interface MetaSectionData {
  title: string;
  rows: MetaRow[];
}

interface ExifData {
  Make?: string;
  Model?: string;
  LensModel?: string;
  ExposureTime?: number;
  FNumber?: number;
  ISO?: number;
  FocalLength?: number;
  DateTimeOriginal?: Date | string;
  CreateDate?: Date | string;
  ImageWidth?: number;
  ImageHeight?: number;
  ExifImageWidth?: number;
  ExifImageHeight?: number;
  ColorSpace?: number | string;
  Orientation?: number | string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

export default function ImageMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [sections, setSections] = useState<MetaSectionData[]>([]);
  const [noExif, setNoExif] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    if (
      !["image/jpeg", "image/png", "image/webp", "image/tiff"].includes(f.type)
    ) {
      setError("Please upload a JPEG, PNG, WebP, or TIFF image.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }
    setError("");
    setNoExif(false);
    setSections([]);
    setDimensions(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    // Get natural dimensions
    const img = new Image();
    img.onload = () => setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;

    // Extract EXIF
    try {
      const data: ExifData | null = await exifr.parse(f, {
        tiff: true,
        exif: true,
        gps: true,
        ifd1: false,
      });

      if (!data) {
        setNoExif(true);
        return;
      }

      const result: MetaSectionData[] = [];

      // Basic info is always shown (from File object)
      const basicRows: MetaRow[] = [
        { label: "File name", value: f.name },
        { label: "File size", value: fmtSize(f.size) },
        { label: "Type", value: f.type || "Unknown" },
      ];
      result.push({ title: "Basic", rows: basicRows });

      // Camera section
      const cameraRows: MetaRow[] = [];
      if (data.Make) cameraRows.push({ label: "Make", value: String(data.Make) });
      if (data.Model) cameraRows.push({ label: "Model", value: String(data.Model) });
      if (data.LensModel) cameraRows.push({ label: "Lens", value: String(data.LensModel) });
      if (data.ExposureTime != null) cameraRows.push({ label: "Exposure", value: formatExposure(data.ExposureTime) });
      if (data.FNumber != null) cameraRows.push({ label: "Aperture", value: formatFNumber(data.FNumber) });
      if (data.ISO != null) cameraRows.push({ label: "ISO", value: String(data.ISO) });
      if (data.FocalLength != null) cameraRows.push({ label: "Focal length", value: formatFocalLength(data.FocalLength) });
      if (cameraRows.length > 0) result.push({ title: "Camera", rows: cameraRows });

      // Date section
      const dateRows: MetaRow[] = [];
      if (data.DateTimeOriginal) dateRows.push({ label: "Date taken", value: formatDate(data.DateTimeOriginal) });
      if (data.CreateDate) dateRows.push({ label: "Created", value: formatDate(data.CreateDate) });
      if (dateRows.length > 0) result.push({ title: "Date", rows: dateRows });

      // Image section
      const imageRows: MetaRow[] = [];
      const w = data.ExifImageWidth ?? data.ImageWidth;
      const h = data.ExifImageHeight ?? data.ImageHeight;
      if (w && h) imageRows.push({ label: "Dimensions", value: `${w} × ${h} px` });
      if (data.ColorSpace) imageRows.push({ label: "Color space", value: String(data.ColorSpace) });
      if (data.Orientation) imageRows.push({ label: "Orientation", value: String(data.Orientation) });
      if (imageRows.length > 0) result.push({ title: "Image", rows: imageRows });

      // GPS section
      const gpsRows: MetaRow[] = [];
      if (data.latitude != null) gpsRows.push({ label: "Latitude", value: data.latitude.toFixed(6) });
      if (data.longitude != null) gpsRows.push({ label: "Longitude", value: data.longitude.toFixed(6) });
      if (gpsRows.length > 0) result.push({ title: "GPS", rows: gpsRows });

      if (result.length === 1 && result[0].title === "Basic") {
        // Only basic info, no real EXIF
        setNoExif(true);
      }

      setSections(result);
    } catch {
      setNoExif(true);
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }

  function handleClear() {
    setFile(null);
    setPreviewUrl(null);
    setDimensions(null);
    setSections([]);
    setNoExif(false);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const gpsSection = sections.find((s) => s.title === "GPS");
  const lat = gpsSection?.rows.find((r) => r.label === "Latitude")?.value;
  const lng = gpsSection?.rows.find((r) => r.label === "Longitude")?.value;
  const mapsUrl =
    lat && lng
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;

  return (
    <ToolLayout tool={tool} relatedTools={getRelatedTools(tool)}>
      <div className="space-y-4">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-16 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ImageIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Drop an image here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP, TIFF — max 10 MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/tiff"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Small preview */}
              <div className="flex-shrink-0">
                <div className="flex max-h-48 w-32 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl!} alt="Preview" className="max-h-48 max-w-full object-contain" />
                </div>
                {dimensions && (
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    {dimensions.w} × {dimensions.h}
                  </p>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{fmtSize(file.size)} · {file.type}</p>
                <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>

            {noExif && (
              <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                No EXIF metadata found in this image.
              </div>
            )}

            {sections.length > 0 && (
              <div className="space-y-3">
                {sections.map((section) => (
                  <div key={section.title} className="rounded-lg border border-border bg-card overflow-hidden">
                    <div className="border-b border-border bg-muted/30 px-4 py-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {section.title}
                      </h3>
                    </div>
                    <div className="divide-y divide-border">
                      {section.rows.map((row) => (
                        <div key={row.label} className="flex items-start gap-4 px-4 py-2.5">
                          <span className="w-28 shrink-0 text-xs text-muted-foreground">{row.label}</span>
                          <span className="text-sm break-all">{row.value}</span>
                        </div>
                      ))}
                    </div>
                    {section.title === "GPS" && mapsUrl && (
                      <div className="border-t border-border px-4 py-2.5">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          View on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
