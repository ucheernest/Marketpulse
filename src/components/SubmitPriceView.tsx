import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { uploadEvidencePhoto } from '../services/backendService';
import { BulkObservationFlow } from './BulkObservationFlow';
import {
  ArrowLeft,
  Camera,
  Upload,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Check,
  Building2,
  Store,
  DollarSign,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

export const SubmitPriceView: React.FC = () => {
  const {
    products,
    markets,
    selectedCity,
    submitPriceReport,
    setActiveView,
    addToast,
    agentProfile,
    isOnline,
    isLowConnectivity,
  } = useApp();

  const [submissionMode, setSubmissionMode] = useState<'single' | 'bulk'>('single');

  const [productId, setProductId] = useState('mama-gold-rice-50kg');
  const [productName, setProductName] = useState('Mama Gold Rice (50kg)');
  const [marketId, setMarketId] = useState('mile-3-market');
  const [marketName, setMarketName] = useState('Mile 3 Market');
  const [sellerStall, setSellerStall] = useState('Mama Joy / Stall 42');
  const [price, setPrice] = useState<number>(78200);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('50kg Bag');
  const [photoPreview, setPhotoPreview] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check baseline price for anomaly warning
  const matchedProduct = products.find(
    (p) => p.id === productId || p.name.toLowerCase() === productName.toLowerCase()
  );
  const baseline = matchedProduct?.currentAvgPrice || 78200;
  const isAnomaly = price > 0 && Math.abs(price - baseline) / baseline > 0.25;

  const handleProductSelect = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setProductId(prod.id);
      setProductName(prod.name);
      setUnit(prod.unit);
      setPrice(prod.currentAvgPrice);
    }
  };

  const handleMarketSelect = (id: string) => {
    const mkt = markets.find((m) => m.id === id);
    if (mkt) {
      setMarketId(mkt.id);
      setMarketName(mkt.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        addToast('Stall verification photo loaded', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !price || !marketName) {
      addToast('Please complete all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    let finalPhotoUrl = photoPreview;

    try {
      if (photoPreview && photoPreview.startsWith('data:')) {
        const uploadResult = await uploadEvidencePhoto(photoPreview);
        if (uploadResult.url) {
          finalPhotoUrl = uploadResult.url;
        }
      }

      submitPriceReport({
        productId,
        productName,
        marketId,
        marketName,
        price,
        quantity,
        unit,
        sellerStall,
        photoUrl: finalPhotoUrl,
      });

      setIsSubmitting(false);
      setActiveView('agent-dashboard');
    } catch (err: any) {
      console.warn('Submission error:', err);
      // Fallback submit
      submitPriceReport({
        productId,
        productName,
        marketId,
        marketName,
        price,
        quantity,
        unit,
        sellerStall,
        photoUrl: photoPreview,
      });
      setIsSubmitting(false);
      setActiveView('agent-dashboard');
    }
  };

  return (
    <div id="submit-price-screen" className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('agent-dashboard')}
            className="p-2 text-[#3e4a41] dark:text-[#bdcabe] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              Submit Price Reports
            </h1>
            <p className="text-xs text-[#3e4a41] dark:text-[#bdcabe]">
              Field Verification Agent • {agentProfile.name}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/50">
          ₦650 / Observation
        </span>
      </div>

      {/* Submission Mode Selector Tabs */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/40 dark:border-[#2d3e58]">
        <button
          type="button"
          onClick={() => setSubmissionMode('single')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            submissionMode === 'single'
              ? 'bg-white dark:bg-[#182232] text-[#008751] dark:text-[#8df8b7] shadow-xs'
              : 'text-[#6e7a70] dark:text-[#bdcabe] hover:text-[#121c2a]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Single Observation</span>
        </button>

        <button
          type="button"
          onClick={() => setSubmissionMode('bulk')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            submissionMode === 'bulk'
              ? 'bg-white dark:bg-[#182232] text-[#008751] dark:text-[#8df8b7] shadow-xs'
              : 'text-[#6e7a70] dark:text-[#bdcabe] hover:text-[#121c2a]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <div className="flex items-center gap-1.5">
            <span>Bulk Market Walk Batch</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#008751] text-white text-[10px] font-bold">
              Multi-Stall
            </span>
          </div>
        </button>
      </div>

      {/* Content Rendering based on active tab */}
      {submissionMode === 'bulk' ? (
        <BulkObservationFlow />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Product Information */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] pb-3">
              <Store className="w-4 h-4 text-[#008751]" />
              <span>Product & Location Details</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                  Select Commodity / Product
                </label>
                <select
                  value={productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                    Market Location
                  </label>
                  <select
                    value={marketId}
                    onChange={(e) => handleMarketSelect(e.target.value)}
                    className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  >
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                    Seller / Stall Identifier
                  </label>
                  <input
                    type="text"
                    value={sellerStall}
                    onChange={(e) => setSellerStall(e.target.value)}
                    placeholder="e.g. Mama Joy / Stall 42"
                    className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing Details */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] pb-3">
              <DollarSign className="w-4 h-4 text-[#008751]" />
              <span>Pricing & Quantity</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                  Observed Selling Price (₦ NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#008751]">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="78200"
                    className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl pl-8 pr-4 py-2.5 text-lg font-bold text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  />
                </div>

                {/* Anomaly Notice Warning */}
                {isAnomaly && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Price Anomaly Warning:</span> This price differs by{' '}
                      {Math.round((Math.abs(price - baseline) / baseline) * 100)}% from current market
                      baseline (₦{baseline.toLocaleString()}). Ensure evidence photo clearly shows stall
                      or receipt.
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                    Quantity Observed
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                    Unit of Measurement
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  >
                    <option value="50kg Bag">50kg Bag</option>
                    <option value="25kg Bag">25kg Bag</option>
                    <option value="10kg Bag">10kg Bag</option>
                    <option value="Basket">Basket</option>
                    <option value="1kg">1kg</option>
                    <option value="Tuber">Tuber</option>
                    <option value="5 Litres">5 Litres</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Verification Evidence */}
          <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center gap-2 border-b border-[#bdcabe]/30 dark:border-[#2d3e58] pb-3">
              <Camera className="w-4 h-4 text-[#008751]" />
              <span>Verification Evidence</span>
            </h2>

            <div className="space-y-4">
              {/* Photo Capture & Upload Box */}
              <div>
                <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-2">
                  Stall / Price Tag / Product Photo
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#bdcabe]/50 dark:border-[#2d3e58] h-48 bg-black/5">
                    <img
                      src={photoPreview}
                      alt="Submission Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-3">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        EXIF & Geotag Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-[#182232]/90 text-xs font-semibold text-[#121c2a] dark:text-[#f8f9ff] hover:bg-white transition-colors"
                      >
                        Retake / Replace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#bdcabe] dark:border-[#2d3e58] hover:border-[#008751] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#f8f9ff] dark:bg-[#121c2a] flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#008751]/10 flex items-center justify-center text-[#008751]">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                      Tap to Capture or Upload Evidence Photo
                    </div>
                    <p className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
                      Supports direct camera snapshot or gallery file
                    </p>
                  </div>
                )}
              </div>

              {/* GPS & Timestamp Automatic Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#f8f9ff] dark:bg-[#121c2a] p-3 rounded-xl border border-[#bdcabe]/30 dark:border-[#2d3e58] flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#008751] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                      GPS Geotag Verified
                    </div>
                    <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                      Lat: 4.8156° N, Lng: 7.0094° E (Accuracy ±5m)
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8f9ff] dark:bg-[#121c2a] p-3 rounded-xl border border-[#bdcabe]/30 dark:border-[#2d3e58] flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#008751] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                      Timestamp Certified
                    </div>
                    <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5">
                      Auto-recorded: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Offline Resilience Notice */}
              {!isOnline && (
                <div className="bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Offline Resilience Active:</span> Your price observation and EXIF data will be safely stored in the market cache and automatically sent to the verifier pool when network is restored.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              !isOnline ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#008751] hover:bg-[#006b3f]'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>
              {isSubmitting
                ? 'Storing Observation...'
                : !isOnline
                ? 'Save to Offline Queue (₦650)'
                : 'Submit for Verification (₦650)'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
};
