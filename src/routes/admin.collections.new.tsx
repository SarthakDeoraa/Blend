import React, { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/collections/new")({
  head: () => ({
    meta: [
      { title: "New Collection — Blend Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewCollectionPage,
});

function NewCollectionPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("/assets/cat-table.jpg");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a collection name");
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("collections").insert({
          name: name.trim(),
          slug: slug.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          image_url: imageUrl,
          status: "published",
          sort_order: 10,
        });

        if (error) throw error;
      } catch (err: unknown) {
        console.error("Error creating collection:", err);
        const message = err instanceof Error ? err.message : "Database error";
        toast.error(`Could not create collection: ${message}`);
        setSubmitting(false);
        return;
      }
    }

    toast.success(`Collection "${name}" created!`);
    navigate({ to: "/admin/collections" });
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds the 5 MB limit");
      return;
    }

    // Give immediate feedback while the file uploads to Supabase Storage.
    const reader = new FileReader();
    reader.onload = (event) => setImageUrl(event.target?.result as string);
    reader.readAsDataURL(file);

    if (!isSupabaseConfigured) {
      toast.success("Cover image ready for preview");
      return;
    }

    try {
      setUploadingImage(true);
      toast.info("Uploading cover image…");
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = `collections/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(path);

      setImageUrl(publicUrl);
      toast.success("Cover image uploaded successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(`Upload error: ${message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/collections">
            <Button
              variant="ghost"
              size="icon"
              className="text-stone-400 hover:text-white rounded-xl"
            >
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-100">Add Collection</h1>
            <p className="text-xs text-stone-400 mt-0.5">Create a new showcase category</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/collections">
            <Button
              variant="outline"
              className="border-stone-800 bg-stone-900 text-stone-300 text-xs rounded-xl"
            >
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={submitting || uploadingImage}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl text-xs flex items-center gap-2 px-5 h-10 shadow-lg shadow-amber-950/20"
          >
            <Save size={15} />
            <span>Save Collection</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="colName" className="text-xs text-stone-300">
              Collection Name <span className="text-amber-400">*</span>
            </Label>
            <Input
              id="colName"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. River Dining Tables"
              required
              className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug" className="text-xs text-stone-300">
              URL Address (Slug)
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-mono">/collections/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="river-dining-tables"
                className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="text-xs text-stone-300">
              Short Tagline
            </Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Sculptural centerpieces for grand dining spaces"
              className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-stone-300">
              Full Category Description
            </Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the artisan techniques, materials, and care instructions..."
              className="bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl resize-none text-sm"
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="coverImage" className="text-xs text-stone-300">
                Collection Cover Image
              </Label>
              <p className="mt-1 text-xs text-stone-500">
                This image appears on the collection card and collection page.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div className="border-2 border-dashed border-stone-800 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-colors bg-stone-950/40">
                <input
                  type="file"
                  id="coverImage"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label htmlFor="coverImage" className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                    <Upload size={22} />
                  </div>
                  <p className="text-sm font-medium text-stone-200">
                    {uploadingImage ? "Uploading cover image…" : "Click to choose a cover image"}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Supports JPEG, PNG, or WebP up to 5 MB
                  </p>
                </label>
              </div>

              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-stone-800 bg-stone-950">
                <img
                  src={imageUrl}
                  alt="Collection cover preview"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-md bg-stone-950/80 px-2 py-1 text-[10px] font-medium text-stone-300">
                  Cover preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
