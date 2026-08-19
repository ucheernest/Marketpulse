import React, { useMemo } from 'react';
import { Apple, ArrowRight, Coffee, Fish, HeartPulse, Search, Sparkles, Store, Utensils } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCategory } from '../types';

const categories = [
  ['Food Staples', Utensils], ['Fresh Food', Apple], ['Meat & Seafood', Fish],
  ['Household', Sparkles], ['Personal Care', HeartPulse], ['Beverages', Coffee],
] as const;

export const ConsumerHome: React.FC = () => {
  const { products, markets, selectedCity, searchQuery, setSearchQuery, setSelectedCategory, setActiveView, openProductDetail, dataLoading, dataError } = useApp();
  const verified = useMemo(() => products.filter((p) => p.hasVerifiedPrice).sort((a,b) => new Date(b.lastVerifiedAt || 0).getTime() - new Date(a.lastVerifiedAt || 0).getTime()), [products]);
  const averageConfidence = verified.length ? Math.round(verified.reduce((s,p)=>s+p.confidenceScore,0)/verified.length) : 0;
  const latest = verified[0]?.lastVerified || 'No published field data yet';
  const submit = (e:React.FormEvent) => { e.preventDefault(); setActiveView('search'); };
  return <div className="space-y-8 pb-20">
    <section className="max-w-3xl mx-auto text-center pt-4 sm:pt-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#008751] mb-2">Verified everyday market prices</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">What price are you checking?</h1>
      <p className="text-sm text-[#6e7a70] dark:text-[#bdcabe] mt-2">Search products and see verified observations by market in {selectedCity}.</p>
      <form onSubmit={submit} className="mt-5 flex items-center gap-2 bg-white dark:bg-[#182232] border border-[#bdcabe]/60 dark:border-[#2d3e58] rounded-full p-2 shadow-sm">
        <Search className="w-5 h-5 ml-2 text-[#6e7a70]"/><input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Rice, tomatoes, palm oil, Maggi, tissue…" className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"/><button className="w-10 h-10 rounded-full bg-[#008751] text-white flex items-center justify-center"><ArrowRight className="w-5 h-5"/></button>
      </form>
    </section>

    <section className="grid grid-cols-3 md:grid-cols-6 gap-3">{categories.map(([name,Icon])=><button key={name} onClick={()=>{setSelectedCategory(name as ProductCategory);setActiveView('search')}} className="p-3 rounded-2xl bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] hover:border-[#008751] flex flex-col items-center gap-2"><span className="w-11 h-11 rounded-full bg-[#008751]/10 text-[#006b3f] dark:text-[#8df8b7] flex items-center justify-center"><Icon className="w-5 h-5"/></span><span className="text-[11px] font-semibold text-center">{name}</span></button>)}</section>

    <section className="grid sm:grid-cols-4 gap-3">
      <Snapshot label="Verified products" value={verified.length} /><Snapshot label="Pilot markets configured" value={markets.length} /><Snapshot label="Average confidence" value={verified.length ? `${averageConfidence}%` : '—'} /><Snapshot label="Latest verification" value={latest} compact />
    </section>

    {dataError && <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs"><b>Live data unavailable.</b> Showing only the last successfully loaded verified catalog where available. No synthetic prices are substituted.</div>}

    <section>
      <div className="flex items-end justify-between gap-3 mb-4"><div><h2 className="text-xl font-bold">Recently verified</h2><p className="text-xs text-[#6e7a70] mt-1">Freshest published observations in {selectedCity}</p></div><button onClick={()=>setActiveView('search')} className="text-xs font-bold text-[#006b3f] flex items-center gap-1">View all <ArrowRight className="w-4 h-4"/></button></div>
      {dataLoading && products.length===0 ? <div className="py-14 text-center text-sm text-[#6e7a70]">Loading verified catalog…</div> : verified.length===0 ? <div className="py-14 rounded-2xl border border-dashed border-[#bdcabe] text-center"><Store className="w-8 h-8 mx-auto text-[#008751]"/><p className="font-bold mt-3">No verified prices published yet</p><p className="text-xs text-[#6e7a70] mt-1">The catalog is ready. Prices appear here only after a field observation is approved.</p></div> : <div className="grid md:grid-cols-2 gap-4">{verified.slice(0,6).map((p)=><button key={p.id} onClick={()=>openProductDetail(p)} className="text-left bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 flex gap-4 hover:border-[#008751]"><img src={p.image} alt="" className="w-20 h-20 rounded-xl object-cover bg-[#eef6f1]"/><div className="min-w-0 flex-1"><p className="font-bold truncate">{p.name}</p><p className="text-xs text-[#6e7a70] mt-0.5">{p.unit} · {p.lastVerified}</p><p className="text-2xl font-bold mt-2">₦{p.currentAvgPrice.toLocaleString()}</p><p className="text-[11px] text-[#6e7a70]">₦{p.priceLow.toLocaleString()}–₦{p.priceHigh.toLocaleString()} · {p.confidenceScore}% confidence</p></div></button>)}</div>}
    </section>
  </div>;
};
const Snapshot:React.FC<{label:string;value:string|number;compact?:boolean}>=({label,value,compact})=><div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4"><p className={`${compact?'text-sm':'text-2xl'} font-bold`}>{value}</p><p className="text-xs text-[#6e7a70] mt-1">{label}</p></div>;
