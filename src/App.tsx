/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Layout, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  ExternalLink, 
  RefreshCw,
  Download,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Key
} from 'lucide-react';
import { analyzeProduct, generateBannerImage } from './services/gemini';
import { BannerPreview } from './components/BannerPreview';
import type { BannerContent } from './types';

const BANNER_SIZES = [
  { width: 300, height: 250, label: 'Medium Rectangle' },
  { width: 728, height: 90, label: 'Leaderboard' },
  { width: 160, height: 600, label: 'Wide Skyscraper' },
  { width: 336, height: 280, label: 'Large Rectangle' },
  { width: 320, height: 50, label: 'Mobile Leaderboard' },
  { width: 970, height: 250, label: 'Billboard' },
];

const ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"] as const;
const IMAGE_SIZES = ["1K", "2K", "4K"] as const;

export default function App() {
  const [url, setUrl] = useState('https://chandrasekarsilks.in/');
  const [description, setDescription] = useState('Exquisite handloom silk sarees from Kanchipuram. Traditional designs with modern elegance.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [content, setContent] = useState<BannerContent | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Settings
  const [selectedRatio, setSelectedRatio] = useState<typeof ASPECT_RATIOS[number]>("16:9");
  const [selectedSize, setSelectedSize] = useState<typeof IMAGE_SIZES[number]>("1K");

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
      setError("Please select an API key first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const analyzed = await analyzeProduct(url, description);
      setContent(analyzed);
      
      setIsGeneratingImage(true);
      const generatedImage = await generateBannerImage(analyzed.imagePrompt, selectedRatio, selectedSize);
      setImageUrl(generatedImage);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setError("API Key session expired or invalid. Please re-select your key.");
      } else {
        setError(err.message || "Failed to generate banners. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BannerGenius</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {!hasApiKey ? (
              <button 
                onClick={handleSelectKey}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                <Key size={16} />
                Select API Key
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle2 size={16} />
                API Key Active
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <div className="flex items-center gap-2 mb-6">
                <Settings2 className="text-zinc-400 w-5 h-5" />
                <h2 className="font-semibold">Campaign Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Product URL</label>
                  <div className="relative">
                    <input 
                      type="url" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                    />
                    <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Product Description</label>
                  <textarea 
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What are you selling? Who is it for?"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Aspect Ratio</label>
                    <select 
                      value={selectedRatio}
                      onChange={(e) => setSelectedRatio(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Image Quality</label>
                    <select 
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isAnalyzing || isGeneratingImage}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isAnalyzing || isGeneratingImage ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Banners
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </section>

            {content && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200"
              >
                <div className="flex items-center gap-2 mb-6">
                  <TypeIcon className="text-zinc-400 w-5 h-5" />
                  <h2 className="font-semibold">Generated Copy</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Headline</span>
                    <p className="text-sm font-medium">{content.headline}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Subheadline</span>
                    <p className="text-sm text-zinc-600">{content.subheadline}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CTA</span>
                    <p className="text-sm font-bold text-emerald-600">{content.cta}</p>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Layout className="text-zinc-400 w-5 h-5" />
                <h2 className="text-xl font-bold">Banner Previews</h2>
              </div>
              {imageUrl && (
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                  <Download size={16} />
                  Download All
                </button>
              )}
            </div>

            {!content && !isAnalyzing ? (
              <div className="h-[600px] border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon size={32} />
                </div>
                <p className="font-medium">Enter details and generate to see previews</p>
                <p className="text-sm">We'll create 6 standard banner sizes for you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <AnimatePresence mode="popLayout">
                  {BANNER_SIZES.map((size, idx) => (
                    <motion.div
                      key={size.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex justify-center"
                    >
                      <BannerPreview 
                        size={size}
                        content={content || {
                          headline: 'Generating...',
                          subheadline: 'Please wait while we craft your message.',
                          cta: '...',
                          brandColors: { primary: '#e4e4e7', secondary: '#f4f4f5', accent: '#d4d4d8' }
                        }}
                        imageUrl={imageUrl}
                        loading={isAnalyzing || isGeneratingImage}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-12 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-400 text-sm">
          <p>© 2024 BannerGenius AI. Powered by Google Gemini.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-zinc-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">Privacy</a>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="hover:text-zinc-600 transition-colors underline decoration-zinc-200">Billing Info</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
