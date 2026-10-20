import React, { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { ArrowLeft, Save, FolderPlus, Upload } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/collections/new')({
  head: () => ({
    meta: [
      { title: 'New Collection — Blend Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: NewCollectionPage,
});

function NewCollectionPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/assets/cat-table.jpg');
  const [submitting, setSubmitting] = useState(false);

  // Auto generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('collections').insert({
          name: name.trim(),
          slug: slug.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          image_url: imageUrl,
          status: 'published',
          sort_order: 10,
        });

        if (error) throw error;
      } catch (err) {
        console.error('Error creating collection:', err);
      }
    }

    toast.success(`Collection "${name}" created!`);
    navigate({ to: '/admin/collections' });
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/collections">
            <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white rounded-xl">
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
            <Button variant="outline" className="border-stone-800 bg-stone-900 text-stone-300 text-xs rounded-xl">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
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
        </div>
      </form>
    </div>
  );
}
