"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Close, Plus } from "@/components/icons";

type ImageValue = {
  image: string;
  images: string[];
};

type ProductImagesProps = ImageValue & {
  disabled?: boolean;
  onChange: (next: ImageValue) => void;
};

const MAX_SHOWCASE_IMAGES = 12;
const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45";
const smallInputClass =
  "mt-2 h-9 w-full rounded-lg border border-line bg-white/70 px-3 text-[11px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40";

function isImageSource(value: string) {
  return /^(https?:\/\/|\/|data:image\/)/i.test(value.trim());
}

async function postImages(data: FormData) {
  let lastError = "Unable to upload the image.";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: data,
    });
    const result = (await response.json().catch(() => ({}))) as {
      urls?: string[];
      error?: string;
    };

    if (response.ok && result.urls && result.urls.length > 0) {
      return result.urls;
    }

    lastError = result.error ?? lastError;

    // Next.js dev can briefly answer with a stale "Server Action" 404 while a
    // route is being compiled after a reload. One retry fixes that race.
    if (
      attempt === 0 &&
      response.status === 404 &&
      /server action/i.test(lastError)
    ) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      continue;
    }

    break;
  }

  throw new Error(lastError);
}

export function ProductImages({
  image,
  images,
  disabled = false,
  onChange,
}: ProductImagesProps) {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const showcaseInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"main" | "showcase" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftUrl, setDraftUrl] = useState("");

  const upload = async (
    event: ChangeEvent<HTMLInputElement>,
    target: "main" | "showcase",
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setError(null);
    setUploading(target);

    try {
      const data = new FormData();
      files.forEach((file) => data.append("files", file));

      const urls = await postImages(data);

      if (target === "main") {
        onChange({ image: urls[0], images });
      } else if (!image) {
        onChange({
          image: urls[0],
          images: [...images, ...urls.slice(1)].slice(0, MAX_SHOWCASE_IMAGES),
        });
      } else {
        onChange({
          image,
          images: [
            ...images,
            ...urls.filter((url) => url !== image),
          ].slice(0, MAX_SHOWCASE_IMAGES),
        });
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to upload the image.",
      );
    } finally {
      setUploading(null);
    }
  };

  const addDraftUrl = () => {
    const source = draftUrl.trim();

    if (!source) return;

    if (!isImageSource(source)) {
      setError("Image links must start with http://, https:// or /.");
      return;
    }

    setError(null);
    setDraftUrl("");

    if (!image) {
      onChange({ image: source, images });
      return;
    }

    if (images.includes(source) || source === image) {
      setError("That picture is already in the gallery.");
      return;
    }

    onChange({
      image,
      images: [...images, source].slice(0, MAX_SHOWCASE_IMAGES),
    });
  };

  const promote = (index: number) => {
    const nextMain = images[index];
    if (!nextMain) return;

    const nextImages = images.filter((_, itemIndex) => itemIndex !== index);

    if (image) {
      nextImages.unshift(image);
    }

    onChange({ image: nextMain, images: nextImages });
  };

  return (
    <div className="rounded-2xl border border-line bg-cream/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={labelClass}>Product pictures</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink/45">
            The main picture is used on cards and as the first detail image.
            Showcase pictures appear as the extra gallery shots.
          </p>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-medium text-ink/45">
          JPG, PNG, WebP, AVIF or GIF · up to 8 MB
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[190px_1fr]">
        <div>
          <p className={labelClass}>Main picture</p>
          <div className="mt-2 aspect-[4/5] overflow-hidden rounded-xl border border-line bg-beige">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Main product picture"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-[11px] text-ink/35">
                No main picture yet
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              disabled={disabled || uploading !== null}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-3 text-[10px] font-semibold text-cream transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              {uploading === "main" ? "Uploading..." : image ? "Replace" : "Upload"}
            </button>
            {image && (
              <button
                type="button"
                onClick={() => onChange({ image: "", images })}
                disabled={disabled || uploading !== null}
                className="inline-flex h-8 items-center justify-center rounded-full border border-line px-3 text-[10px] font-semibold text-ink/55 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => upload(event, "main")}
          />
          <input
            value={image}
            onChange={(event) =>
              onChange({ image: event.target.value, images })
            }
            disabled={disabled}
            placeholder="or paste an image URL"
            className={smallInputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <p className={labelClass}>Showcase pictures</p>
            <span className="text-[10px] text-ink/35">
              {images.length} / {MAX_SHOWCASE_IMAGES}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((source, index) => (
              <div
                key={`${source}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-beige"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={source}
                  alt={`Showcase picture ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      image,
                      images: images.filter((_, itemIndex) => itemIndex !== index),
                    })
                  }
                  disabled={disabled}
                  aria-label={`Remove showcase picture ${index + 1}`}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/75 text-cream transition-colors hover:bg-ink disabled:opacity-50"
                >
                  <Close className="h-3 w-3" />
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => promote(index)}
                    disabled={disabled}
                    className="absolute inset-x-1 bottom-1 rounded-full bg-ink/75 px-1.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-cream transition-colors hover:bg-ink disabled:opacity-50"
                  >
                    Set main
                  </button>
                )}
              </div>
            ))}

            {images.length < MAX_SHOWCASE_IMAGES && (
              <button
                type="button"
                onClick={() => showcaseInputRef.current?.click()}
                disabled={disabled || uploading !== null}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink/25 bg-white/50 text-[10px] font-semibold text-ink/45 transition-colors hover:border-ink/45 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {uploading === "showcase" ? "Uploading..." : "Add"}
              </button>
            )}
          </div>

          <input
            ref={showcaseInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => upload(event, "showcase")}
          />

          <div className="mt-2 flex gap-2">
            <input
              value={draftUrl}
              onChange={(event) => setDraftUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addDraftUrl();
                }
              }}
              disabled={disabled}
              placeholder="Paste an image URL and add it"
              className="h-9 flex-1 rounded-lg border border-line bg-white/70 px-3 text-[11px] text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/40"
            />
            <button
              type="button"
              onClick={addDraftUrl}
              disabled={disabled || !draftUrl.trim()}
              className="inline-flex h-9 items-center rounded-lg border border-line px-3 text-[10px] font-semibold text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-50"
            >
              Add URL
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[11px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
