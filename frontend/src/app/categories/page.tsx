import Link from 'next/link';
import { Hammer, Wrench, Paintbrush, Zap, HardHat, ShieldCheck, ArrowRight, Truck, Sparkles, Home, Users } from 'lucide-react';
import { API_BASE_URL, cleanName } from '@/lib/api';

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

const CATEGORY_ICONS: { [key: string]: any } = {
  Electrician: Zap,
  Plumber: Wrench,
  Carpenter: Hammer,
  Painter: Paintbrush,
  Mason: HardHat,
  Construction: HardHat,
  "Tractor Driver": Truck,
  "Cleaner / Sweeper": Sparkles,
  "House Help / Maid": Home,
  "Daily Wage Labourer": Users,
  "Construction Worker": HardHat,
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md mb-4">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-300" /> Verified On-Demand Workforce
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Browse All Service Categories
          </h1>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
            Explore skilled trades, certified blue-collar professionals, and specialized service contractors available for instant hire or contract project booking.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">No categories found or server unreachable.</p>
          </div>
        ) : (
          categories.map((cat: any) => {
            const name = cleanName(cat.name);
            const IconComponent = CATEGORY_ICONS[name] || Wrench;
            return (
              <div 
                key={cat.profession_id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      Verified Skill
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {cat.description || `Professional ${name.toLowerCase()} services for residential, commercial, and industrial contract needs.`}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Avg Rate Range</span>
                    <span className="text-sm font-bold text-gray-900">₹300 - ₹800 / hr</span>
                  </div>
                  <Link 
                    href={`/?category=${cat.profession_id}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                  >
                    View Workers <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bulk / Enterprise Hiring Promo Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Need a large team or specialized crew?</h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Contractors & group leaders can create multi-worker teams and place bulk workforce orders for construction, events, and commercial projects.
          </p>
        </div>
        <Link 
          href="/contractor"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap shadow-lg transition-colors"
        >
          Explore Contractor Hub
        </Link>
      </div>
    </div>
  );
}
