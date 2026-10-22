import React, { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Image as ImageIcon, Save, Upload } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/collections/new")({
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: (search.id as string) || undefined,
  }),
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
  const search = Route.useSearch();
  const editId = search.id;
  const isEditing = Boolean(editId);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  // The public route identifier is required internally, but it is derived
  // from the collection name so it does not need to be managed manually.
  const generatedSlug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  useEffect(() => {
    if (!editId || !isSupabaseConfigured) return;

    async function loadCollection() {
      try {
        setLoadingData(true);
        const { data, error } = await supabase
          .from("collections")
          .select("name, slug, tagline, description, image_url")
          .eq("id", editId)
          .is("deleted_at", null)
          .single();

        if (error || !data) throw error || new Error("Collection not found");

        setName(data.name || "");
        setTagline(data.tagline || "");
        setDescription(data.description || "");
        setImageUrl(data.image_url || "");
      } catch (err) {
        console.error("Error loading collection:", err);
        toast.error("Could not load collection details");
      } finally {
        setLoadingData(false);
      }
    }

    loadCollection();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a collection name");
      return;
    }

    if (!generatedSlug) {
      toast.error("Use at least one letter or number in the collection name");
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured) {
      try {
        const collectionData = {
          name: name.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          image_url: imageUrl || null,
        };
        const { error } =
          isEditing && editId
            ? await supabase.from("collections").update(collectionData).eq("id", editId)
            : await supabase.from("collections").insert({
                ...collectionData,
                slug: generatedSlug,
                status: "published",
                sort_order: 10,
              });

        if (error) throw error;
      } catch (err: unknown) {
        console.error("Error creating collection:", err);
        const message = err instanceof Error ? err.message : "Database error";
        toast.error(`Could not create collection: ${message}`, {
          description: "Run the Supabase setup SQL, then sign in with your Supabase admin account.",
        });
        setSubmitting(false);
        return;
      }
    }

    toast.success(`Collection "${name}" ${isEditing ? "updated" : "created"}!`);
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
      const isPolicyError = message.toLowerCase().includes("row-level security");
      toast.error(
        isPolicyError
          ? "Image upload is blocked by Supabase permissions"
          : `Upload error: ${message}`,
        isPolicyError
          ? { description: "Run the Supabase setup SQL, then sign in again before uploading." }
          : undefined,
      );
    } finally {
      setUploadingImage(false);
    }
  };

  if (loadingData) {
    return (
      <div className="py-24 text-center text-stone-400 text-sm">
        <span className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mb-3" />
        <p>Loading collection details…</p>
      </div>
    );
  }

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
            <h1 className="font-serif text-2xl font-semibold text-stone-100">
              {isEditing ? "Edit Collection" : "Add Collection"}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {isEditing ? "Update this showcase category" : "Create a new showcase category"}
            </p>
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
            <span>{isEditing ? "Save Changes" : "Save Collection"}</span>
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
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. River Dining Tables"
              required
              className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
            />
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
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Collection cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-500">
                    <ImageIcon size={24} />
                    <span className="text-[10px]">No cover selected</span>
                  </div>
                )}
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
