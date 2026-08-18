'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import API from '@/lib/api';
import Navbar from '@/components/Navbar';

const categoryIcons = {
  electrician: '⚡',
  plumber: '🔧',
  cleaner: '🧹',
  'house cleaner': '🧹',
  barber: '✂️',
  carpenter: '🪚',
  painter: '🎨',
  ac: '❄️',
  'ac repair': '❄️',
  generator: '⚙️',
  mechanic: '🔩',
  tailor: '🧵',
  chef: '👨‍🍳',
  driver: '🚗',
  default: '🛠️',
};

const getCategoryIcon = (name = '') => {
  const key = name.toLowerCase();
  for (const [k, icon] of Object.entries(categoryIcons)) {
    if (key.includes(k)) return icon;
  }
  return categoryIcons.default;
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) setSearch(query);
  }, [query]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, providersRes, servicesRes] = await Promise.all([
          API.get('/categories/'),
          API.get('/providers/'),
          API.get(query ? `/services/?search=${encodeURIComponent(query)}` : '/services/'),
        ]);
        setCategories(categoriesRes.data || []);
        setProviders(providersRes.data || []);
        setServices(servicesRes.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/');
    }
  };

  const clearSearch = () => {
    setSearch('');
    setSelectedCategory('All');
    router.push('/');
  };

  const filteredServices =
    selectedCategory === 'All'
      ? services
      : services.filter(
          (s) => s.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
        );

  const popularCategories = categories.slice(0, 8);
  const topProviders = providers.slice(0, 4);

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-24 sm:pt-28 pb-12 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Find pros for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              any task
            </span>
          </h1>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto mt-6">
            <div className="flex items-center bg-slate-900/90 border border-white/10 rounded-2xl p-1.5 shadow-xl">
              <span className="pl-3 text-slate-500">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full px-3 py-3 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* CATEGORY FILTER ICONS */}
      <section className="border-y border-white/5 bg-slate-950/50 sticky top-16 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              <span>🏠</span> All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                <span>{getCategoryIcon(cat.name)}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {selectedCategory === 'All' ? 'All Services' : selectedCategory}
            </h2>
            <span className="text-xs text-slate-500">
              {filteredServices.length} listings
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-900/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No services found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => router.push(`/services/${service.id}`)}
                  className="group cursor-pointer bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/40 transition"
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-40 object-cover group-hover:scale-[1.02] transition"
                    />
                  ) : (
                    <div className="w-full h-40 bg-slate-800 flex items-center justify-center text-3xl">
                      {getCategoryIcon(service.category?.name)}
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">
                        {getCategoryIcon(service.category?.name)}
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        ₦{Number(service.price || 0).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-blue-300 transition">
                      {service.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>👤 {service.provider?.user?.username || 'Pro'}</span>
                      <span className="text-blue-400">Book →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-14 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-white mb-6">Categories</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {popularCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className="group p-5 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-blue-500/40 transition text-center"
              >
                <div className="text-3xl mb-2">{getCategoryIcon(cat.name)}</div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition truncate">
                  {cat.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TOP PROVIDERS */}
      <section className="py-14 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-white mb-6">Top Pros</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topProviders.map((provider) => (
              <Link
                key={provider.id}
                href={`/providers/${provider.id}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shrink-0">
                  {getInitials(provider.user?.username || 'P')}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white group-hover:text-blue-300 transition truncate">
                    {provider.user?.username || 'Provider'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ⭐ {provider.average_rating > 0 ? Number(provider.average_rating).toFixed(1) : 'New'}
                    {' · '}📍 {provider.city || 'Lagos'}
                  </p>
                </div>
                <span className="text-slate-500 text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SkillLink
      </footer>
    </div>
  );
}