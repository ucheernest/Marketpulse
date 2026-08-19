import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, LocateFixed, MapPin, Send, ShieldAlert, WifiOff, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DeviceLocation } from '../types';

export const SubmitPriceView: React.FC = () => {
  const { products, markets, agentProfile, setActiveView, submitPriceReport, addToast, isOnline, isLowConnectivity } = useApp();
  const assignedIds = useMemo(() => new Set(agentProfile.assignedMarkets.map((m) => m.id)), [agentProfile.assignedMarkets]);
  const assignedMarkets = useMemo(() => markets.filter((m) => assignedIds.has(m.id)), [markets, assignedIds]);

  const [productId, setProductId] = useState('');
  const [marketId, setMarketId] = useState('');
  const [price, setPrice] = useState('');
  const [sellerStall, setSellerStall] = useState('');
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => { if (!productId && products[0]) setProductId(products[0].id); }, [products, productId]);
  useEffect(() => {
    if (!marketId && assignedMarkets[0]) setMarketId(assignedMarkets[0].id);
    if (marketId && !assignedIds.has(marketId)) setMarketId(assignedMarkets[0]?.id || '');
  }, [assignedMarkets, assignedIds, marketId]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => undefined);
    }
  }, [cameraOpen]);
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const product = products.find((p) => p.id === productId);
  const market = assignedMarkets.find((m) => m.id === marketId);
  const numericPrice = Number(price);
  const deviation = product?.hasVerifiedPrice && numericPrice > 0
    ? Math.abs(numericPrice - product.currentAvgPrice) / product.currentAvgPrice * 100
    : 0;

  const captureLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) { setLocationError('This device/browser does not provide location services.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracyMeters: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null, capturedAt: new Date(pos.timestamp || Date.now()).toISOString() });
        setLocating(false);
      },
      (err) => { setLocationError(err.message || 'Location permission was not granted.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  };

  const openCamera = async () => {
    setCameraError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera capture requires a supported browser over HTTPS.');
      return;
    }
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1600 }, height: { ideal: 1200 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error: any) {
      setCameraError(error?.message || 'Camera permission was not granted.');
    }
  };

  const captureEvidencePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('The camera is not ready yet. Try again in a moment.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setCameraError('Could not capture the camera frame.'); return; }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    if (!blob) { setCameraError('Could not encode the evidence photo.'); return; }
    const file = new File([blob], `market-evidence-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    handlePhoto(file);
    closeCamera();
  };

  const handlePhoto = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { addToast('Evidence must be JPEG, PNG, or WebP.', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { addToast('Evidence photo must be 10 MB or smaller.', 'error'); return; }
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file); setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !market) { addToast('Choose a product and one of your assigned markets.', 'warning'); return; }
    if (!numericPrice || numericPrice <= 0) { addToast('Enter a valid price.', 'warning'); return; }
    if (!photo) { addToast('A current market photo is required as evidence.', 'warning'); return; }
    if (!location) { addToast('Capture your device location before submitting.', 'warning'); return; }
    const locationAgeMs = Date.now() - new Date(location.capturedAt).getTime();
    if (!Number.isFinite(locationAgeMs) || locationAgeMs < -5 * 60_000 || locationAgeMs > 15 * 60_000) {
      setLocation(null);
      setLocationError('Your saved coordinates are too old. Recapture your current location before submitting.');
      addToast('Recapture your current location before submitting.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await submitPriceReport({
        productId: product.id, productName: product.name, marketId: market.id, marketName: market.name,
        price: numericPrice, unit: product.unit, sellerStall: sellerStall.trim(), evidenceFile: photo,
        evidenceMimeType: photo.type, location,
      });
      setPrice(''); setSellerStall(''); setPhoto(null); setLocation(null);
      if (preview) URL.revokeObjectURL(preview); setPreview(null);
      setActiveView('agent-dashboard');
    } catch (error: any) { addToast(error?.message || 'The observation could not be submitted.', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-5">
      <div className="flex items-start gap-3">
        <button onClick={() => setActiveView('agent-dashboard')} className="p-2 rounded-full hover:bg-[#eff4ff] dark:hover:bg-[#25344a]"><ArrowLeft className="w-5 h-5" /></button>
        <div><h1 className="text-2xl font-bold">Submit Market Price</h1><p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] mt-1">One canonical product/pack per observation. GPS and photo evidence are required.</p></div>
      </div>

      {(!isOnline || isLowConnectivity) && <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 flex gap-3 text-sm"><WifiOff className="w-5 h-5 text-amber-600 shrink-0"/><div><p className="font-bold">Offline-safe capture</p><p className="text-xs mt-1">If connectivity is unavailable, the photo and observation will be stored in IndexedDB on this device and synchronized later.</p></div></div>}

      {!agentProfile.isFieldActive || assignedMarkets.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-5"><div className="flex gap-3"><ShieldAlert className="w-5 h-5 text-rose-600"/><div><p className="font-bold">No active market assignment</p><p className="text-xs mt-1 text-[#6e7a70]">A super admin must assign this field-agent account to at least one active market before prices can be collected.</p></div></div></div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-[#6e7a70]">Product / pack</span><select value={productId} onChange={(e)=>setProductId(e.target.value)} className="w-full rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] bg-[#f8f9ff] dark:bg-[#121c2a] px-3 py-3 text-sm">{products.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-[#6e7a70]">Assigned market</span><select value={marketId} onChange={(e)=>setMarketId(e.target.value)} className="w-full rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] bg-[#f8f9ff] dark:bg-[#121c2a] px-3 py-3 text-sm">{assignedMarkets.map((m)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-[#6e7a70]">Observed price (₦)</span><input type="number" inputMode="decimal" min="1" step="0.01" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="0" className="w-full rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] bg-[#f8f9ff] dark:bg-[#121c2a] px-3 py-3 text-lg font-bold" /></label>
            <div className="space-y-1.5"><span className="text-xs font-bold uppercase tracking-wide text-[#6e7a70]">Canonical unit / pack</span><div className="w-full rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] bg-[#eff4ff] dark:bg-[#121c2a] px-3 py-3 text-sm font-semibold">{product?.unit || '—'} <span className="text-xs font-normal text-[#6e7a70]">(locked)</span></div></div>
          </div>

          {deviation >= 20 && <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex gap-2 text-xs"><ShieldAlert className="w-4 h-4 text-amber-600 shrink-0"/><span>This price differs by about {deviation.toFixed(0)}% from the latest published {selectedCityLabel(product)} benchmark. You can still submit it; the server will independently score it as a possible anomaly.</span></div>}

          <label className="space-y-1.5 block"><span className="text-xs font-bold uppercase tracking-wide text-[#6e7a70]">Seller / stall reference <span className="font-normal">(optional)</span></span><input value={sellerStall} onChange={(e)=>setSellerStall(e.target.value)} placeholder="e.g. Grain line, Stall 14" className="w-full rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] bg-[#f8f9ff] dark:bg-[#121c2a] px-3 py-3 text-sm" /></label>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58] p-4 space-y-3">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#008751]"/><p className="text-sm font-bold">Device location</p></div>
              {location ? <div className="text-xs space-y-1 text-[#526057] dark:text-[#bdcabe]"><p>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p><p>Accuracy: {location.accuracyMeters ? `±${Math.round(location.accuracyMeters)} m` : 'not reported'}</p><p>Captured: {new Date(location.capturedAt).toLocaleTimeString()}</p></div> : <p className="text-xs text-[#6e7a70]">No coordinates captured yet.</p>}
              {locationError && <p className="text-xs text-rose-600">{locationError}</p>}
              <button type="button" onClick={captureLocation} disabled={locating} className="w-full py-2.5 rounded-xl border border-[#008751] text-[#006b3f] dark:text-[#8df8b7] text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"><LocateFixed className="w-4 h-4"/>{locating ? 'Capturing…' : location ? 'Recapture location' : 'Capture current location'}</button>
            </div>

            <div className="rounded-2xl border border-[#bdcabe]/40 dark:border-[#2d3e58] p-4 space-y-3">
              <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-[#008751]"/><p className="text-sm font-bold">Photo evidence</p></div>
              {preview ? <div className="relative"><img src={preview} alt="Observation evidence preview" className="w-full h-36 object-cover rounded-xl"/><button type="button" onClick={()=>{ if(preview) URL.revokeObjectURL(preview); setPreview(null); setPhoto(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white"><X className="w-4 h-4"/></button></div> : <button type="button" onClick={()=>void openCamera()} className="w-full h-36 rounded-xl border-2 border-dashed border-[#bdcabe] flex flex-col items-center justify-center gap-2 text-xs text-[#6e7a70]"><Camera className="w-6 h-6"/><span>Take live evidence photo</span><span className="text-[10px]">Gallery uploads are not used for field evidence.</span></button>}
              {cameraError && <p className="text-[11px] text-rose-600">{cameraError}</p>}
              {photo && <p className="text-[11px] text-[#6e7a70]">Live camera capture · {(photo.size/1024/1024).toFixed(1)} MB. Photo presence is verified on the server; EXIF is not claimed unless separately evaluated.</p>}
            </div>
          </div>

          {cameraOpen && (
            <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-3">
              <div className="w-full max-w-lg bg-[#121c2a] text-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 flex items-center justify-between"><div><p className="font-bold">Live evidence camera</p><p className="text-[11px] text-white/65">Frame the product, shelf/stall or visible price evidence.</p></div><button type="button" onClick={closeCamera} className="p-2 rounded-full bg-white/10"><X className="w-5 h-5"/></button></div>
                <div className="bg-black aspect-[4/3] flex items-center justify-center"><video ref={videoRef} playsInline muted className="w-full h-full object-cover" /></div>
                <div className="p-4"><button type="button" onClick={()=>void captureEvidencePhoto()} className="w-full py-3.5 rounded-xl bg-[#008751] text-white font-bold flex items-center justify-center gap-2"><Camera className="w-5 h-5"/>Capture evidence</button></div>
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting || !photo || !location || !numericPrice} className="w-full py-3.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"><Send className="w-4 h-4"/>{submitting ? 'Submitting securely…' : isOnline ? 'Submit for verification' : 'Save to offline outbox'}</button>
          <div className="flex gap-2 text-[11px] text-[#6e7a70]"><CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0"/><span>The browser does not decide whether a price is “verified.” Submission evidence, market assignment, GPS, anomaly score and final approval are evaluated by the Supabase trust workflow.</span></div>
        </form>
      )}
    </div>
  );
};

function selectedCityLabel(product?: { hasVerifiedPrice: boolean }) { return product?.hasVerifiedPrice ? 'city' : 'recent'; }
