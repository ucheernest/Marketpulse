import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient, Session, User } from '@supabase/supabase-js';
import {
  BarChart3,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Database,
  Eye,
  Home,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iqavukfmeahqnovrkcuo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_5RovDlCqQdsibyqQDVo2BA_7uRCmAoO';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

type AppTab = 'home' | 'search' | 'markets' | 'saved' | 'profile' | 'agent' | 'admin';
type AuthMode = 'signin' | 'signup' | 'forgot';

type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  avatar_url?: string | null;
  preferred_city?: string | null;
  role?: 'public_user' | 'field_agent' | 'verifier_admin' | 'super_admin' | string;
  is_active?: boolean | null;
  gender?: string | null;
  date_of_birth?: string | null;
  country?: string | null;
  state_of_residence?: string | null;
  bio?: string | null;
  auth_provider?: string | null;
  email_confirmed_at?: string | null;
};

type GenericRow = Record<string, any>;

const roleLabel = (role?: string | null) => {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'verifier_admin') return 'Verifier Admin';
  if (role === 'field_agent') return 'Field Agent';
  return 'Consumer';
};

const isAdminRole = (role?: string | null) => role === 'super_admin' || role === 'verifier_admin';
const isAgentRole = (role?: string | null) => role === 'field_agent';

const productName = (row: GenericRow) =>
  row.name || row.product_name || row.display_name || row.canonical_name || 'Product';

const marketName = (row: GenericRow) => row.name || row.market_name || row.display_name || 'Market';

const priceForProduct = (prices: GenericRow[], productId: string) =>
  prices.find((p) => String(p.product_id) === String(productId));

const formatNaira = (value: any) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `₦${n.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
};

const firstPrice = (row?: GenericRow) => {
  if (!row) return null;
  return formatNaira(
    row.average_price ?? row.avg_price ?? row.price ?? row.current_price ?? row.mean_price ?? row.median_price,
  );
};

const firstVerifiedAt = (row?: GenericRow) =>
  row?.last_verified_at || row?.verified_at || row?.updated_at || row?.captured_at || null;

const relativeDate = (value?: string | null) => {
  if (!value) return 'Awaiting verification';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Recently verified';
  const diff = Date.now() - d.getTime();
  const hours = Math.max(0, Math.floor(diff / 3_600_000));
  if (hours < 1) return 'Verified less than 1 hour ago';
  if (hours < 24) return `Verified ${hours}h ago`;
  return `Verified ${Math.floor(hours / 24)}d ago`;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<AppTab>('home');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [products, setProducts] = useState<GenericRow[]>([]);
  const [markets, setMarkets] = useState<GenericRow[]>([]);
  const [cityPrices, setCityPrices] = useState<GenericRow[]>([]);
  const [query, setQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [dataMessage, setDataMessage] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession) {
        setProfile(null);
        setSavedIds(new Set());
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void loadPublicData();
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadProfile(user.id);
    void loadSaved(user.id);
  }, [user?.id]);

  const loadPublicData = async () => {
    setLoadingData(true);
    setDataMessage('');
    const [productRes, marketRes, priceRes] = await Promise.all([
      supabase.from('products').select('*').limit(200),
      supabase.from('markets').select('*').eq('is_active', true).limit(100),
      supabase.from('published_city_prices').select('*').limit(500),
    ]);
    if (productRes.error) setDataMessage('Catalog is temporarily unavailable.');
    setProducts((productRes.data || []).filter((p: any) => p.is_active !== false));
    setMarkets(marketRes.data || []);
    setCityPrices(priceRes.data || []);
    setLoadingData(false);
  };

  const loadProfile = async (id: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (data) setProfile(data as Profile);
  };

  const loadSaved = async (id: string) => {
    const { data } = await supabase.from('saved_products').select('product_id').eq('user_id', id);
    setSavedIds(new Set((data || []).map((row: any) => String(row.product_id))));
  };

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((p) => {
      const text = [productName(p), p.slug, p.unit, p.pack_label, p.description].filter(Boolean).join(' ').toLowerCase();
      return text.includes(needle);
    });
  }, [products, query]);

  const openAuth = (mode: AuthMode = 'signin') => {
    setAuthMode(mode);
    setAuthMessage('');
    setAuthOpen(true);
    setMobileMenu(false);
  };

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage('');
    try {
      if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;
        setAuthMessage('Password reset instructions have been sent if that email is registered.');
        return;
      }
      if (authMode === 'signup') {
        const acceptedAt = new Date().toISOString();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName.trim(),
              name: fullName.trim(),
              preferred_city: 'Port Harcourt',
              terms_version: '1.0',
              privacy_version: '1.0',
              terms_accepted_at: acceptedAt,
              privacy_accepted_at: acceptedAt,
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          setAuthOpen(false);
          setTab('profile');
        } else {
          setAuthMessage('Account created. Check your email to confirm your account, then sign in.');
        }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setAuthOpen(false);
      setTab('profile');
    } catch (error: any) {
      setAuthMessage(error?.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setTab('home');
  };

  const toggleSaved = async (productId: string) => {
    if (!user) {
      openAuth('signin');
      return;
    }
    const next = new Set(savedIds);
    if (next.has(productId)) {
      const { error } = await supabase
        .from('saved_products')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (!error) next.delete(productId);
    } else {
      const { error } = await supabase.from('saved_products').insert({ user_id: user.id, product_id: productId });
      if (!error) next.add(productId);
    }
    setSavedIds(next);
  };

  const go = (next: AppTab) => {
    if ((next === 'saved' || next === 'profile') && !user) {
      if (next === 'profile') {
        setTab('profile');
      } else {
        openAuth('signin');
      }
      return;
    }
    setTab(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibleSavedProducts = products.filter((p) => savedIds.has(String(p.id)));

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => go('home')} className="flex items-center gap-2 text-left">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">MarketPulse</div>
              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 sm:block">
                Verified market intelligence
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <TopNav active={tab === 'home'} onClick={() => go('home')}>Home</TopNav>
            <TopNav active={tab === 'search'} onClick={() => go('search')}>Search</TopNav>
            <TopNav active={tab === 'markets'} onClick={() => go('markets')}>Markets</TopNav>
            {user && <TopNav active={tab === 'saved'} onClick={() => go('saved')}>Saved</TopNav>}
            {isAgentRole(profile?.role) && <TopNav active={tab === 'agent'} onClick={() => go('agent')}>Agent</TopNav>}
            {isAdminRole(profile?.role) && <TopNav active={tab === 'admin'} onClick={() => go('admin')}>Admin</TopNav>}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={() => go('profile')}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold shadow-sm transition hover:border-emerald-300 sm:flex"
              >
                <CircleUserRound size={18} className="text-emerald-700" />
                <span className="max-w-32 truncate">{profile?.full_name || user.email?.split('@')[0] || 'Profile'}</span>
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                  {roleLabel(profile?.role)}
                </span>
              </button>
            ) : (
              <button
                onClick={() => openAuth('signin')}
                className="hidden items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 sm:flex"
              >
                <LogIn size={17} /> Sign in
              </button>
            )}
            <button
              onClick={() => setMobileMenu((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white md:hidden"
              aria-label="Open menu"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <div className="mx-auto grid max-w-7xl gap-1">
              <MobileLink onClick={() => go('home')}>Home</MobileLink>
              <MobileLink onClick={() => go('search')}>Search prices</MobileLink>
              <MobileLink onClick={() => go('markets')}>Markets</MobileLink>
              {user ? (
                <>
                  <MobileLink onClick={() => go('saved')}>Saved products</MobileLink>
                  <MobileLink onClick={() => go('profile')}>Profile</MobileLink>
                  {isAgentRole(profile?.role) && <MobileLink onClick={() => go('agent')}>Field agent workspace</MobileLink>}
                  {isAdminRole(profile?.role) && <MobileLink onClick={() => go('admin')}>Admin workspace</MobileLink>}
                </>
              ) : (
                <MobileLink onClick={() => openAuth('signin')}>Sign in / Create account</MobileLink>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 md:pb-10">
        {tab === 'home' && (
          <HomeView
            products={products}
            prices={cityPrices}
            markets={markets}
            loading={loadingData}
            message={dataMessage}
            savedIds={savedIds}
            onSave={toggleSaved}
            onSearch={() => go('search')}
            onMarkets={() => go('markets')}
            onLogin={() => openAuth('signin')}
            user={user}
          />
        )}
        {tab === 'search' && (
          <SearchView
            query={query}
            setQuery={setQuery}
            products={filteredProducts}
            prices={cityPrices}
            savedIds={savedIds}
            onSave={toggleSaved}
          />
        )}
        {tab === 'markets' && <MarketsView markets={markets} prices={cityPrices} />}
        {tab === 'saved' && user && (
          <SavedView products={visibleSavedProducts} prices={cityPrices} onSave={toggleSaved} />
        )}
        {tab === 'profile' && (
          <ProfileView
            user={user}
            profile={profile}
            reload={() => user && loadProfile(user.id)}
            onLogin={() => openAuth('signin')}
            onSignup={() => openAuth('signup')}
            onSignOut={signOut}
            onAgent={() => go('agent')}
            onAdmin={() => go('admin')}
          />
        )}
        {tab === 'agent' && <AgentView user={user} profile={profile} products={products} markets={markets} />}
        {tab === 'admin' && <AdminView user={user} profile={profile} />}
      </main>

      <MobileBottomNav tab={tab} user={user} onGo={go} />

      {authOpen && (
        <AuthDialog
          mode={authMode}
          setMode={setAuthMode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          fullName={fullName}
          setFullName={setFullName}
          busy={authBusy}
          message={authMessage}
          onSubmit={handleAuth}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </div>
  );
}

function HomeView({
  products,
  prices,
  markets,
  loading,
  message,
  savedIds,
  onSave,
  onSearch,
  onMarkets,
  onLogin,
  user,
}: any) {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 px-5 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-12">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
            <ShieldCheck size={15} /> Port Harcourt pilot · verified observations only
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            Know the market price before you go to the market.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
            Search real Nigerian market prices collected by field agents, checked against evidence and location, and published with freshness and confidence.
          </p>
          <button
            onClick={onSearch}
            className="mt-7 flex w-full max-w-xl items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left text-slate-600 shadow-lg sm:px-5"
          >
            <Search size={20} className="text-emerald-700" />
            <span className="flex-1 font-semibold">Search rice, tomatoes, palm oil, toothpaste…</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Database size={20} />} label="Catalog products" value={products.length} />
        <Metric icon={<Store size={20} />} label="Active pilot markets" value={markets.length} />
        <Metric icon={<ShieldCheck size={20} />} label="Published verified prices" value={prices.length} />
      </section>

      {!user && (
        <section className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-black text-emerald-950">Your MarketPulse account is now available.</div>
            <p className="mt-1 text-sm text-emerald-800">Sign in to save products, manage your profile and access role-based workspaces.</p>
          </div>
          <button onClick={onLogin} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white">
            Sign in / Create account
          </button>
        </section>
      )}

      <section>
        <SectionHeading title="Products to watch" action="See all" onAction={onSearch} />
        {message && <Notice>{message}</Notice>}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((p: GenericRow) => (
              <ProductCard key={p.id} product={p} price={priceForProduct(prices, p.id)} saved={savedIds.has(String(p.id))} onSave={onSave} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading title="Port Harcourt markets" action="View markets" onAction={onMarkets} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {markets.slice(0, 6).map((m: GenericRow) => (
            <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><MapPin size={19} /></div>
                <div>
                  <div className="font-black">{marketName(m)}</div>
                  <div className="mt-1 text-sm text-slate-500">{m.city || m.location || 'Port Harcourt'}</div>
                  <div className="mt-3 inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">Active pilot market</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SearchView({ query, setQuery, products, prices, savedIds, onSave }: any) {
  return (
    <div className="space-y-6">
      <PageHeading title="Search verified prices" subtitle="Search the canonical MarketPulse catalog. Prices appear only after verified observations are published." />
      <div className="sticky top-20 z-20 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <Search size={20} className="text-emerald-700" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try rice, Maggi, palm oil…" className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-slate-400" />
          {query && <button onClick={() => setQuery('')}><X size={18} /></button>}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-slate-700">{products.length} product{products.length === 1 ? '' : 's'}</span>
        <span className="text-slate-500">Port Harcourt</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p: GenericRow) => (
          <ProductCard key={p.id} product={p} price={priceForProduct(prices, p.id)} saved={savedIds.has(String(p.id))} onSave={onSave} />
        ))}
      </div>
      {!products.length && <EmptyState icon={<Search size={26} />} title="No matching product" text="Try a broader product name or another spelling." />}
    </div>
  );
}

function MarketsView({ markets, prices }: any) {
  return (
    <div className="space-y-6">
      <PageHeading title="Markets in Port Harcourt" subtitle="Active markets in the first MarketPulse verification pilot." />
      <div className="grid gap-4 md:grid-cols-2">
        {markets.map((m: GenericRow) => {
          const marketPrices = prices.filter((p: GenericRow) => String(p.market_id || '') === String(m.id));
          return (
            <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Store size={21} /></div>
                  <div>
                    <h3 className="font-black">{marketName(m)}</h3>
                    <p className="mt-1 text-sm text-slate-500">{m.city || m.location || 'Port Harcourt, Rivers'}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">Active</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                <div><div className="text-slate-500">Published prices</div><div className="mt-1 font-black">{marketPrices.length}</div></div>
                <div><div className="text-slate-500">Verification</div><div className="mt-1 font-black">Field evidence</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SavedView({ products, prices, onSave }: any) {
  return (
    <div className="space-y-6">
      <PageHeading title="Saved products" subtitle="Your personal watchlist. Saved items remain private to your account." />
      {products.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: GenericRow) => <ProductCard key={p.id} product={p} price={priceForProduct(prices, p.id)} saved onSave={onSave} />)}
        </div>
      ) : (
        <EmptyState icon={<Bookmark size={26} />} title="Nothing saved yet" text="Use the bookmark on a product to add it to your watchlist." />
      )}
    </div>
  );
}

function ProfileView({ user, profile, reload, onLogin, onSignup, onSignOut, onAgent, onAdmin }: any) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ full_name: '', phone_number: '', preferred_city: 'Port Harcourt', state_of_residence: '', country: 'Nigeria', bio: '', gender: '', date_of_birth: '' });

  useEffect(() => {
    setForm({
      full_name: profile?.full_name || '',
      phone_number: profile?.phone_number || '',
      preferred_city: profile?.preferred_city || 'Port Harcourt',
      state_of_residence: profile?.state_of_residence || '',
      country: profile?.country || 'Nigeria',
      bio: profile?.bio || '',
      gender: profile?.gender || '',
      date_of_birth: profile?.date_of_birth || '',
    });
  }, [profile?.id, profile?.full_name, profile?.phone_number, profile?.bio]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><UserRound size={30} /></div>
          <h1 className="mt-5 text-2xl font-black">Your MarketPulse profile</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Sign in to save products, manage your profile and access any field-agent or admin role assigned to your account.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={onLogin} className="rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">Sign in</button>
            <button onClick={onSignup} className="rounded-xl border border-slate-200 px-5 py-3 font-black">Create account</button>
          </div>
        </div>
      </div>
    );
  }

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const save = async () => {
    setBusy(true); setMessage('');
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id);
    if (error) setMessage(error.message);
    else { setMessage('Profile updated.'); setEditing(false); await reload(); }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Profile" subtitle="Your identity, account status and MarketPulse access." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-emerald-100 text-xl font-black text-emerald-800">
              {profile?.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" /> : (profile?.full_name || user.email || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-black">{profile?.full_name || 'MarketPulse user'}</div>
              <div className="truncate text-sm text-slate-500">{user.email}</div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">{roleLabel(profile?.role)}</span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${profile?.is_active === false ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{profile?.is_active === false ? 'Inactive' : 'Active account'}</span>
          </div>
          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <InfoRow label="Provider" value={profile?.auth_provider || user.app_metadata?.provider || 'email'} />
            <InfoRow label="Preferred city" value={profile?.preferred_city || 'Port Harcourt'} />
            <InfoRow label="Email" value={user.email || '—'} />
          </div>
          {(isAgentRole(profile?.role) || isAdminRole(profile?.role)) && (
            <div className="mt-6 grid gap-2">
              {isAgentRole(profile?.role) && <button onClick={onAgent} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white">Open agent workspace</button>}
              {isAdminRole(profile?.role) && <button onClick={onAdmin} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white">Open admin workspace</button>}
            </div>
          )}
          <button onClick={onSignOut} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"><LogOut size={17} /> Sign out</button>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-xl font-black">Personal details</h2><p className="mt-1 text-sm text-slate-500">Role and account status are controlled by MarketPulse administrators.</p></div>
            <button onClick={() => setEditing((v) => !v)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black">{editing ? 'Cancel' : 'Edit profile'}</button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.full_name} disabled={!editing} onChange={(v: string) => update('full_name', v)} />
            <Field label="Phone number" value={form.phone_number} disabled={!editing} onChange={(v: string) => update('phone_number', v)} />
            <Field label="Preferred city" value={form.preferred_city} disabled={!editing} onChange={(v: string) => update('preferred_city', v)} />
            <Field label="State of residence" value={form.state_of_residence} disabled={!editing} onChange={(v: string) => update('state_of_residence', v)} />
            <Field label="Country" value={form.country} disabled={!editing} onChange={(v: string) => update('country', v)} />
            <Field label="Gender" value={form.gender} disabled={!editing} onChange={(v: string) => update('gender', v)} />
            <Field label="Date of birth" value={form.date_of_birth} type="date" disabled={!editing} onChange={(v: string) => update('date_of_birth', v)} />
            <div className="sm:col-span-2"><Field label="Bio" value={form.bio} disabled={!editing} onChange={(v: string) => update('bio', v)} /></div>
          </div>
          {message && <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{message}</div>}
          {editing && <button disabled={busy} onClick={save} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save profile'}</button>}
        </section>
      </div>
    </div>
  );
}

function AgentView({ user, profile, products, markets }: any) {
  const [rows, setRows] = useState<GenericRow[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!user || !isAgentRole(profile?.role)) return;
    setLoading(true);
    supabase.from('price_observations').select('*').order('created_at', { ascending: false }).limit(25).then(({ data }) => {
      setRows(data || []); setLoading(false);
    });
  }, [user?.id, profile?.role]);

  if (!user || !isAgentRole(profile?.role)) return <AccessDenied title="Field agent access required" text="This workspace appears only after an administrator assigns your account the Field Agent role and an active market assignment." />;

  return (
    <div className="space-y-6">
      <PageHeading title="Field agent workspace" subtitle="Capture real market observations with evidence, location and timestamp integrity." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Database size={20} />} label="Visible observations" value={rows.length} />
        <Metric icon={<Store size={20} />} label="Pilot markets" value={markets.length} />
        <Metric icon={<Search size={20} />} label="Canonical products" value={products.length} />
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <div className="font-black">Evidence-first submission</div>
        <p className="mt-1 leading-6">Price submission is restricted to assigned field agents. Camera evidence, fresh high-accuracy GPS and the canonical product pack are required before the backend will accept an observation.</p>
      </div>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black">Recent observation history</h2>
        {loading ? <p className="mt-4 text-sm text-slate-500">Loading…</p> : rows.length ? (
          <div className="mt-4 divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <div><div className="font-bold">Observation {String(row.id).slice(0, 8)}</div><div className="mt-1 text-slate-500">{row.captured_at ? new Date(row.captured_at).toLocaleString() : 'Captured observation'}</div></div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize">{String(row.status || 'submitted').replaceAll('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : <EmptyState icon={<Database size={24} />} title="No observations yet" text="Your verified field submissions will appear here." />}
      </section>
    </div>
  );
}

function AdminView({ user, profile }: any) {
  const [stats, setStats] = useState({ observations: 0, reports: 0, users: 0, products: 0 });
  const [queue, setQueue] = useState<GenericRow[]>([]);
  const [users, setUsers] = useState<GenericRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isAdminRole(profile?.role)) return;
    setLoading(true);
    Promise.all([
      supabase.from('price_observations').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('price_observations').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('profiles').select('id,full_name,email,role,is_active,preferred_city').order('full_name').limit(30),
    ]).then(([a, b, c, d, q, u]) => {
      setStats({ observations: a.count || 0, reports: b.count || 0, users: c.count || 0, products: d.count || 0 });
      setQueue(q.data || []); setUsers(u.data || []); setLoading(false);
    });
  }, [user?.id, profile?.role]);

  if (!user || !isAdminRole(profile?.role)) return <AccessDenied title="Admin access required" text="Verification and administration are restricted to verifier administrators and the protected super administrator." />;

  return (
    <div className="space-y-6">
      <PageHeading title="Admin & verification" subtitle="Live operational data from the MarketPulse backend. No fabricated KPIs." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Database size={20} />} label="Observations" value={stats.observations} />
        <Metric icon={<Eye size={20} />} label="Reports" value={stats.reports} />
        <Metric icon={<UsersRound size={20} />} label="Users" value={stats.users} />
        <Metric icon={<Search size={20} />} label="Products" value={stats.products} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-lg font-black">Verification queue</h2><ShieldCheck size={20} className="text-emerald-700" /></div>
          {loading ? <p className="mt-4 text-sm text-slate-500">Loading…</p> : queue.length ? (
            <div className="mt-4 divide-y divide-slate-100">
              {queue.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <div><div className="font-bold">Observation {String(row.id).slice(0, 8)}</div><div className="mt-1 text-slate-500">{row.captured_at ? new Date(row.captured_at).toLocaleString() : 'Awaiting review'}</div></div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black capitalize text-amber-700">{String(row.status || 'pending').replaceAll('_', ' ')}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={<CheckCircle2 size={24} />} title="Queue is clear" text="There are no price observations awaiting review." />}
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-lg font-black">Users & access</h2><UsersRound size={20} className="text-emerald-700" /></div>
          {users.length ? (
            <div className="mt-4 divide-y divide-slate-100">
              {users.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <div className="min-w-0"><div className="truncate font-bold">{row.full_name || row.email || 'User'}</div><div className="mt-1 truncate text-slate-500">{row.email || row.preferred_city || 'MarketPulse account'}</div></div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{roleLabel(row.role)}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={<UsersRound size={24} />} title="No users visible" text="User records permitted by your role will appear here." />}
        </section>
      </div>
    </div>
  );
}

function AuthDialog({ mode, setMode, email, setEmail, password, setPassword, fullName, setFullName, busy, message, onSubmit, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-2xl font-black">{mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset password' : 'Sign in to MarketPulse'}</h2><p className="mt-1 text-sm text-slate-500">{mode === 'signup' ? 'Your account starts as a consumer account.' : mode === 'forgot' ? 'We will send reset instructions to your email.' : 'Access saved products, profile and your assigned workspace.'}</p></div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && <Field label="Full name" value={fullName} disabled={busy} required onChange={setFullName} />}
          <Field label="Email address" type="email" value={email} disabled={busy} required onChange={setEmail} />
          {mode !== 'forgot' && <Field label="Password" type="password" value={password} disabled={busy} required onChange={setPassword} />}
          {message && <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{message}</div>}
          <button disabled={busy} className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-60">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset email' : 'Sign in'}</button>
        </form>
        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-bold">
          {mode !== 'signin' && <button onClick={() => setMode('signin')} className="text-emerald-700">Sign in</button>}
          {mode !== 'signup' && <button onClick={() => setMode('signup')} className="text-emerald-700">Create account</button>}
          {mode !== 'forgot' && <button onClick={() => setMode('forgot')} className="text-slate-500">Forgot password?</button>}
        </div>
        {mode === 'signup' && <p className="mt-5 text-center text-xs leading-5 text-slate-400">By creating an account you accept the current MarketPulse Terms and Privacy Notice. Staff roles cannot be self-assigned.</p>}
      </div>
    </div>
  );
}

function ProductCard({ product, price, saved, onSave }: any) {
  const amount = firstPrice(price);
  const verified = firstVerifiedAt(price);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Search size={20} /></div>
        <button onClick={() => onSave(String(product.id))} className={`grid h-9 w-9 place-items-center rounded-xl border ${saved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-400'}`} aria-label="Save product"><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-12 text-base font-black leading-6">{productName(product)}</h3>
      {amount ? (
        <div className="mt-3"><div className="text-2xl font-black tracking-tight text-emerald-800">{amount}</div><div className="mt-1 text-xs font-semibold text-slate-500">{relativeDate(verified)}</div></div>
      ) : (
        <div className="mt-3"><div className="text-sm font-black text-slate-700">Awaiting verified data</div><div className="mt-1 text-xs leading-5 text-slate-500">No approved price is published for this product yet.</div></div>
      )}
    </article>
  );
}

function MobileBottomNav({ tab, user, onGo }: { tab: AppTab; user: User | null; onGo: (t: AppTab) => void }) {
  const items: Array<[AppTab, React.ReactNode, string]> = [
    ['home', <Home size={20} />, 'Home'], ['search', <Search size={20} />, 'Search'], ['markets', <MapPin size={20} />, 'Markets'], ['saved', <Bookmark size={20} />, 'Saved'], ['profile', <UserRound size={20} />, 'Profile'],
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(([key, icon, label]) => {
          const active = tab === key;
          return <button key={key} onClick={() => onGo(key)} className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-black ${active ? 'text-emerald-700' : 'text-slate-500'}`}><span className={active ? 'rounded-xl bg-emerald-50 px-3 py-1' : 'px-3 py-1'}>{icon}</span>{key === 'saved' && !user ? 'Saved' : label}</button>;
        })}
      </div>
    </nav>
  );
}

function TopNav({ active, onClick, children }: any) { return <button onClick={onClick} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>{children}</button>; }
function MobileLink({ onClick, children }: any) { return <button onClick={onClick} className="rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-slate-50">{children}</button>; }
function PageHeading({ title, subtitle }: any) { return <div><h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{subtitle}</p></div>; }
function SectionHeading({ title, action, onAction }: any) { return <div className="mb-4 flex items-end justify-between gap-4"><h2 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h2><button onClick={onAction} className="text-sm font-black text-emerald-700">{action}</button></div>; }
function Metric({ icon, label, value }: any) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</div><div><div className="text-2xl font-black">{value}</div><div className="text-xs font-semibold text-slate-500">{label}</div></div></div></div>; }
function InfoRow({ label, value }: any) { return <div className="flex justify-between gap-4"><span className="text-slate-500">{label}</span><span className="max-w-[60%] truncate text-right font-bold capitalize">{value || '—'}</span></div>; }
function Field({ label, value, onChange, disabled, type = 'text', required = false }: any) { return <label className="block"><span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span><input type={type} value={value ?? ''} required={required} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600" /></label>; }
function Notice({ children }: any) { return <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{children}</div>; }
function SkeletonCard() { return <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="h-10 w-10 rounded-xl bg-slate-100" /><div className="mt-5 h-4 w-3/4 rounded bg-slate-100" /><div className="mt-3 h-4 w-1/2 rounded bg-slate-100" /></div>; }
function EmptyState({ icon, title, text }: any) { return <div className="my-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm">{icon}</div><div className="mt-4 font-black">{title}</div><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{text}</p></div>; }
function AccessDenied({ title, text }: any) { return <div className="mx-auto max-w-xl py-12"><div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-600"><ShieldCheck size={27} /></div><h1 className="mt-5 text-xl font-black">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div></div>; }

export default App;
