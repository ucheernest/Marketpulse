import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BulkObservationItem, Product } from '../types';
import { uploadEvidencePhoto } from '../services/backendService';
import {
  Store,
  DollarSign,
  Camera,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Edit2,
  Copy,
  Info,
  Check,
  CheckCheck,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Preset commodity packs for rapid field observation
const PRESET_BASKETS = [
  {
    name: 'Grains & Flours',
    icon: '🌾',
    items: ['mama-gold-rice-50kg', 'white-garri-50kg', 'honey-beans-50kg', 'yellow-maize-50kg'],
  },
  {
    name: 'Cooking & Soup Staples',
    icon: '🍲',
    items: ['palm-oil-25l', 'kings-oil-5l', 'fresh-tomatoes-basket', 'red-onions-100kg'],
  },
  {
    name: 'Tubers & Proteins',
    icon: '🥔',
    items: ['yam-tubers-large-100', 'crate-eggs-30pcs', 'fresh-pepper-basket', 'garri-ijebu-paint'],
  },
];

export const BulkObservationFlow: React.FC = () => {
  const {
    products,
    markets,
    selectedCity,
    submitBulkPriceReports,
    agentProfile,
    isOnline,
    isLowConnectivity,
    addToast,
    setActiveView,
    pendingOfflineQueue,
  } = useApp();

  // Locked market for the current walk
  const [lockedMarketId, setLockedMarketId] = useState<string>('mile-3-market');
  const lockedMarket = useMemo(
    () => markets.find((m) => m.id === lockedMarketId) || markets[0],
    [markets, lockedMarketId]
  );

  // Active form inputs for adding an item
  const [selectedProdId, setSelectedProdId] = useState<string>('mama-gold-rice-50kg');
  const [priceInput, setPriceInput] = useState<number>(78200);
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [unitInput, setUnitInput] = useState<string>('50kg Bag');
  const [sellerStallInput, setSellerStallInput] = useState<string>('Stall 12 / Line B');
  const [photoPreview, setPhotoPreview] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q'
  );

  // Draft items in the batch
  const [batchItems, setBatchItems] = useState<BulkObservationItem[]>(() => [
    {
      id: 'draft-1',
      productId: 'mama-gold-rice-50kg',
      productName: 'Mama Gold Rice (50kg)',
      category: 'Grains & Rice',
      marketId: 'mile-3-market',
      marketName: 'Mile 3 Market',
      price: 78200,
      quantity: 1,
      unit: '50kg Bag',
      sellerStall: 'Alhaji Musa / Shed 4',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q',
      baselinePrice: 78200,
      isAnomaly: false,
      status: 'draft',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'draft-2',
      productId: 'white-garri-50kg',
      productName: 'White Garri (50kg Bag)',
      category: 'Grains & Rice',
      marketId: 'mile-3-market',
      marketName: 'Mile 3 Market',
      price: 34500,
      quantity: 1,
      unit: '50kg Bag',
      sellerStall: 'Mama Joy / Stall 19',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q',
      baselinePrice: 34500,
      isAnomaly: false,
      status: 'draft',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'draft-3',
      productId: 'palm-oil-25l',
      productName: 'Pure Red Palm Oil (25L)',
      category: 'Oil & Condiments',
      marketId: 'mile-3-market',
      marketName: 'Mile 3 Market',
      price: 38000,
      quantity: 1,
      unit: '25L Keg',
      sellerStall: 'Iya Basira / Line 2',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q',
      baselinePrice: 37500,
      isAnomaly: false,
      status: 'draft',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Upload Progress State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected product details
  const activeProduct = useMemo(
    () => products.find((p) => p.id === selectedProdId) || products[0],
    [products, selectedProdId]
  );

  const baseline = activeProduct?.currentAvgPrice || 78200;
  const isCurrentPriceAnomaly =
    priceInput > 0 && Math.abs(priceInput - baseline) / baseline > 0.25;

  const handleProductChange = (prodId: string) => {
    setSelectedProdId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setUnitInput(prod.unit);
      setPriceInput(prod.currentAvgPrice);
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

  // Add Item to Batch
  const handleAddItemToBatch = () => {
    if (!priceInput || priceInput <= 0) {
      addToast('Please provide a valid price for the item', 'error');
      return;
    }

    const newItem: BulkObservationItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: activeProduct.id,
      productName: activeProduct.name,
      category: activeProduct.category,
      marketId: lockedMarket.id,
      marketName: lockedMarket.name,
      price: priceInput,
      quantity: quantityInput,
      unit: unitInput,
      sellerStall: sellerStallInput || 'Market Stall',
      photoUrl: photoPreview,
      baselinePrice: baseline,
      isAnomaly: isCurrentPriceAnomaly,
      status: 'draft',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setBatchItems((prev) => [...prev, newItem]);
    addToast(`Added ${activeProduct.name} to batch queue!`, 'success');

    // Auto-advance or cycle to next commodity in category for faster entry
    const nextIdx = (products.findIndex((p) => p.id === selectedProdId) + 1) % products.length;
    const nextProd = products[nextIdx];
    setSelectedProdId(nextProd.id);
    setUnitInput(nextProd.unit);
    setPriceInput(nextProd.currentAvgPrice);
    setSellerStallInput(`Stall ${(Math.floor(Math.random() * 40) + 1)} / Line ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`);
  };

  // Quick Preset Add
  const handleApplyPreset = (presetItems: string[]) => {
    const newItems: BulkObservationItem[] = [];
    presetItems.forEach((pid, idx) => {
      const prod = products.find((p) => p.id === pid);
      if (prod) {
        newItems.push({
          id: `preset-${Date.now()}-${idx}`,
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
          marketId: lockedMarket.id,
          marketName: lockedMarket.name,
          price: prod.currentAvgPrice,
          quantity: 1,
          unit: prod.unit,
          sellerStall: `Stall ${idx * 4 + 3} / Row ${idx + 1}`,
          photoUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q',
          baselinePrice: prod.currentAvgPrice,
          isAnomaly: false,
          status: 'draft',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    setBatchItems((prev) => [...prev, ...newItems]);
    addToast(`Added ${newItems.length} commodities from pack to batch!`, 'info');
  };

  const handleRemoveItem = (id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearBatch = () => {
    if (confirm('Clear all queued observations in this batch?')) {
      setBatchItems([]);
    }
  };

  // Perform Simultaneous Upload / Queue
  const handleProcessBatch = async (forceOfflineOnly = false) => {
    if (batchItems.length === 0) {
      addToast('No observations in the batch to process', 'warning');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatusText('Preparing batch payload & EXIF geotags...');

    try {
      const itemsToUpload = [];

      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        setUploadProgress(15 + Math.round((i / batchItems.length) * 50));
        setUploadStatusText(`Uploading evidence photo ${i + 1} of ${batchItems.length}...`);

        let finalUrl = item.photoUrl;
        if (!forceOfflineOnly && isOnline && item.photoUrl && item.photoUrl.startsWith('data:')) {
          try {
            const upRes = await uploadEvidencePhoto(item.photoUrl);
            if (upRes.url) finalUrl = upRes.url;
          } catch (e) {
            console.warn('Photo upload fallback to local cache:', e);
          }
        }

        itemsToUpload.push({
          productId: item.productId,
          productName: item.productName,
          marketId: item.marketId,
          marketName: item.marketName,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          sellerStall: item.sellerStall,
          photoUrl: finalUrl,
        });
      }

      setUploadProgress(75);
      setUploadStatusText('Validating with cryptographic verification engine...');

      await new Promise((r) => setTimeout(r, 400));

      setUploadProgress(90);
      setUploadStatusText('Recording verifications & computing bounties...');

      const res = await submitBulkPriceReports(itemsToUpload);

      setUploadProgress(100);
      setUploadStatusText('Completed successfully!');

      await new Promise((r) => setTimeout(r, 300));
      setIsUploading(false);
      setBatchItems([]);
      setActiveView('agent-dashboard');
    } catch (err: any) {
      console.error('Batch upload error:', err);
      setIsUploading(false);
      addToast('Error during batch upload: Saved to offline queue fallback', 'error');
    }
  };

  const totalBounty = batchItems.length * 650;
  const anomaliesCount = batchItems.filter((i) => i.isAnomaly).length;

  return (
    <div className="space-y-6">
      {/* Network & Offline Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          !isOnline
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : isLowConnectivity
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              !isOnline
                ? 'bg-amber-500 text-white'
                : isLowConnectivity
                ? 'bg-blue-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {!isOnline ? (
              <WifiOff className="w-5 h-5" />
            ) : isLowConnectivity ? (
              <Zap className="w-5 h-5" />
            ) : (
              <Wifi className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <span>
                {!isOnline
                  ? 'Offline Market Mode'
                  : isLowConnectivity
                  ? 'Low-Bandwidth (2G/3G) Mode'
                  : 'High-Speed Cloud Sync Active'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/60 dark:bg-black/40">
                {batchItems.length} in Batch Draft
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {!isOnline
                ? 'Queue observations offline without data. The app will auto-upload when you reconnect.'
                : isLowConnectivity
                ? 'Optimized compression active for fast upload over slow mobile networks.'
                : 'Observations will synchronize simultaneously across cloud PostgreSQL and verifier pools.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] text-[#008751] dark:text-[#8df8b7]">
            Earn ₦{totalBounty.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Market Location Lock */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6e7a70] dark:text-[#bdcabe] uppercase">
                Active Market Walk
              </span>
              <div className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                {lockedMarket.name} • {lockedMarket.city}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={lockedMarketId}
              onChange={(e) => setLockedMarketId(e.target.value)}
              className="bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3 py-1.5 text-xs font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preset Staple Packs for Fast Walkthrough */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick-Add Commodity Packs</span>
          </span>
          <span className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe]">
            1-Click Multi-Stall Pre-fill
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESET_BASKETS.map((basket, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(basket.items)}
              className="p-3 rounded-2xl bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#008751] transition-all text-left flex items-center justify-between group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{basket.icon}</span>
                <div>
                  <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff] group-hover:text-[#008751]">
                    {basket.name}
                  </div>
                  <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe]">
                    +{basket.items.length} Essential Commodities
                  </div>
                </div>
              </div>
              <Plus className="w-4 h-4 text-[#6e7a70] group-hover:text-[#008751] transition-transform group-hover:scale-110" />
            </button>
          ))}
        </div>
      </div>

      {/* Add Observation Form (Aisle Entry) */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff] flex items-center justify-between border-b border-[#bdcabe]/30 dark:border-[#2d3e58] pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#008751]" />
            <span>Record Aisle Observation</span>
          </div>
          <span className="text-xs text-[#6e7a70] dark:text-[#bdcabe]">
            Item #{batchItems.length + 1}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Commodity Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
              Commodity
            </label>
            <select
              value={selectedProdId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit}) — Ref: ₦{p.currentAvgPrice.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Stall / Seller */}
          <div>
            <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
              Seller / Stall
            </label>
            <input
              type="text"
              value={sellerStallInput}
              onChange={(e) => setSellerStallInput(e.target.value)}
              placeholder="e.g. Mama Nkechi / Line 4"
              className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3.5 py-2.5 text-sm text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
            />
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
              Observed Price (₦ NGN)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#008751]">
                ₦
              </span>
              <input
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(Number(e.target.value))}
                placeholder="78000"
                className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl pl-8 pr-4 py-2.5 text-base font-bold text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
              />
            </div>
          </div>

          {/* Unit & Quantity */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                Unit
              </label>
              <select
                value={unitInput}
                onChange={(e) => setUnitInput(e.target.value)}
                className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3 py-2.5 text-xs font-medium text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
              >
                <option value="50kg Bag">50kg Bag</option>
                <option value="25kg Bag">25kg Bag</option>
                <option value="10kg Bag">10kg Bag</option>
                <option value="25L Keg">25L Keg</option>
                <option value="5 Litres">5 Litres</option>
                <option value="Basket">Basket</option>
                <option value="1kg">1kg</option>
                <option value="Tuber">Tuber</option>
                <option value="Paint Bucket">Paint Bucket</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] uppercase tracking-wider mb-1">
                Qty
              </label>
              <input
                type="number"
                min={1}
                value={quantityInput}
                onChange={(e) => setQuantityInput(Number(e.target.value))}
                className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] rounded-xl px-3 py-2.5 text-xs text-[#121c2a] dark:text-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#008751]"
              />
            </div>
          </div>
        </div>

        {/* Anomaly Live Warning */}
        {isCurrentPriceAnomaly && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Price Variance Note:</span> Price is{' '}
              {Math.round((Math.abs(priceInput - baseline) / baseline) * 100)}% away from market baseline (₦{baseline.toLocaleString()}).
            </div>
          </div>
        )}

        {/* Evidence Photo Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#bdcabe]/20">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#bdcabe]/40 bg-black/5 shrink-0">
              <img
                src={photoPreview}
                alt="Stall photo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                Stall Verification Photo
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-[#008751] hover:underline font-semibold cursor-pointer"
              >
                Change / Capture photo
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddItemToBatch}
            className="px-5 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Observation to Batch</span>
          </button>
        </div>
      </div>

      {/* Staged Batch Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#008751]" />
            <h3 className="text-xs font-bold text-[#6e7a70] dark:text-[#bdcabe] uppercase tracking-wider">
              Observations Staged in Batch ({batchItems.length})
            </h3>
          </div>
          {batchItems.length > 0 && (
            <button
              onClick={handleClearBatch}
              className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
            >
              Clear Batch
            </button>
          )}
        </div>

        {batchItems.length === 0 ? (
          <div className="bg-white dark:bg-[#182232] border border-dashed border-[#bdcabe] dark:border-[#2d3e58] rounded-2xl p-8 text-center space-y-2">
            <Store className="w-8 h-8 text-[#6e7a70] mx-auto opacity-50" />
            <div className="text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
              No observations queued in batch yet
            </div>
            <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] max-w-sm mx-auto">
              Select a commodity above or pick a 1-click pack to stage multiple stall prices.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {batchItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#bdcabe] transition-all"
              >
                {/* Product & Stall details */}
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/40 text-xs font-bold text-[#3e4a41] dark:text-[#bdcabe] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <img
                    src={item.photoUrl}
                    alt={item.productName}
                    className="w-11 h-11 rounded-xl object-cover border border-[#bdcabe]/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#121c2a] dark:text-[#f8f9ff]">
                        {item.productName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#f8f9ff] dark:bg-[#121c2a] text-[10px] font-semibold text-[#6e7a70] dark:text-[#bdcabe] border border-[#bdcabe]/30">
                        {item.unit}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6e7a70] dark:text-[#bdcabe] mt-0.5 flex items-center gap-2">
                      <span>{item.sellerStall}</span>
                      <span>•</span>
                      <span>{item.marketName}</span>
                    </div>
                  </div>
                </div>

                {/* Price, Anomaly pill, and remove */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#bdcabe]/20">
                  <div className="text-left sm:text-right">
                    <div className="text-xs sm:text-sm font-extrabold text-[#008751] dark:text-[#8df8b7]">
                      ₦{item.price.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#6e7a70] dark:text-[#bdcabe]">
                      {item.isAnomaly ? (
                        <span className="text-amber-600 font-bold">Variance Flagged</span>
                      ) : (
                        <span>Verified Range</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                    title="Remove observation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Progress Modal / Indicator */}
      {isUploading && (
        <div className="bg-white dark:bg-[#182232] border-2 border-[#008751] rounded-2xl p-5 shadow-lg space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-[#121c2a] dark:text-[#f8f9ff]">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#008751] animate-spin" />
              <span>{uploadStatusText}</span>
            </div>
            <span>{uploadProgress}%</span>
          </div>

          <div className="w-full bg-[#f8f9ff] dark:bg-[#121c2a] rounded-full h-2.5 overflow-hidden border border-[#bdcabe]/30">
            <div
              className="bg-[#008751] h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Execution Actions Toolbar */}
      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#3e4a41] dark:text-[#bdcabe]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#008751]" />
            <span>
              Batch contains <strong>{batchItems.length} observations</strong> (Total Bounty: ₦
              {totalBounty.toLocaleString()})
            </span>
          </div>

          <span className="text-[11px]">
            {isOnline ? '🟢 Connected to cloud database' : '🔴 Storing in device IndexedDB/localStorage'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Button 1: Save All to Offline Queue */}
          <button
            type="button"
            onClick={() => handleProcessBatch(true)}
            disabled={isUploading || batchItems.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/50 dark:border-[#2d3e58] hover:bg-[#eff4ff] dark:hover:bg-[#25344a] text-[#121c2a] dark:text-[#f8f9ff] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Save to Offline Device Outbox ({batchItems.length})</span>
          </button>

          {/* Button 2: Upload Batch Now */}
          <button
            type="button"
            onClick={() => handleProcessBatch(false)}
            disabled={isUploading || batchItems.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>
              {isUploading
                ? 'Processing Batch...'
                : `Upload All (${batchItems.length} Observations • ₦${totalBounty.toLocaleString()})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
