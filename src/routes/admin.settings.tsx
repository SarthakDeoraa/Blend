import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Sliders, Save, Megaphone, Sparkles, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/settings')({
  head: () => ({
    meta: [
      { title: 'Site Settings — Blend Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const [announcementText, setAnnouncementText] = useState(
    'Handcrafted Resin & Wood Art — Bespoke Studio Commissions Open'
  );
  const [heroEyebrow, setHeroEyebrow] = useState('One-of-a-kind art & decor');
  const [heroTitle, setHeroTitle] = useState('Where resin meets raw timber.');
  const [heroDesc, setHeroDesc] = useState(
    'Blend crafts resin, wood and stone into modern art and functional decor for the home. Every piece is designed and hand-poured in our studio.'
  );

  const [email, setEmail] = useState('hello@blenddecor.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [studioAddress, setStudioAddress] = useState('Blend Studio, Industrial Area, Phase II');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Site settings updated successfully!');
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-100">Site Settings</h1>
          <p className="text-xs text-stone-400 mt-0.5">Manage announcement banner, homepage text, and contact information</p>
        </div>

        <Button
          onClick={handleSave}
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl text-xs flex items-center gap-2 px-5 h-10 shadow-lg shadow-amber-950/20"
        >
          <Save size={15} />
          <span>Save Changes</span>
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Top Announcement Bar */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-stone-200">
            <Megaphone size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Top Announcement Bar</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="announce" className="text-xs text-stone-300">
              Banner Message (shown at very top of website)
            </Label>
            <Input
              id="announce"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
            />
          </div>
        </div>

        {/* Hero Section Copy */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-stone-200">
            <Sparkles size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Homepage Hero Section</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eyebrow" className="text-xs text-stone-300">
              Sub-heading / Eyebrow Text
            </Label>
            <Input
              id="eyebrow"
              value={heroEyebrow}
              onChange={(e) => setHeroEyebrow(e.target.value)}
              className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="heroTitle" className="text-xs text-stone-300">
              Main Headline
            </Label>
            <Input
              id="heroTitle"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="heroDesc" className="text-xs text-stone-300">
              Hero Paragraph
            </Label>
            <Textarea
              id="heroDesc"
              rows={3}
              value={heroDesc}
              onChange={(e) => setHeroDesc(e.target.value)}
              className="bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl resize-none text-sm"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-stone-200">
            <Phone size={18} className="text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Studio Contact Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-stone-300">
                Contact Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs text-stone-300">
                Studio Phone / WhatsApp
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs text-stone-300">
              Studio Address / Location
            </Label>
            <Input
              id="address"
              value={studioAddress}
              onChange={(e) => setStudioAddress(e.target.value)}
              className="h-11 bg-stone-950/70 border-stone-800 text-stone-100 rounded-xl"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
