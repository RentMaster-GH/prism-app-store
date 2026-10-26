import React, { useState, useEffect } from 'react';
import { Search, Command, SlidersHorizontal, Filter, X } from 'lucide-react';
import { CategoryType, DevicePlatform } from '../types';

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategory: CategoryType;
  setSelectedCategory: (v: CategoryType) => void;
  selectedDevice: DevicePlatform | 'All';
  setSelectedDevice: (v: DevicePlatform | 'All') => void;
  selectedPriceModel: string;
  setSelectedPriceModel: (v: string) => void;
  sortBy: 'rating' | 'downloads' | 'size';
  setSortBy: (v: 'rating' | 'downloads' | 'size') => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  filteredCount: number;
  categories: string[];
  activeFilterCount: number;
  onOpenCommand: () => void;
}

export const AppsSearchBar: React.FC<Props> = ({
  searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory,
  selectedDevice, setSelectedDevice,
  selectedPriceModel, setSelectedPriceModel,
  sortBy, setSortBy,
  showFilters, setShowFilters,
  filteredCount, categories, activeFilterCount,
  onOpenCommand
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce: only update global search after 300ms
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(localQuery), 300);
    return () => clearTimeout(t);
  }, [localQuery, setSearchQuery]);

  // Sync when cleared externally
  useEffect(() => { setLocalQuery(searchQuery); }, [searchQuery]);

  const DEVICES = ['All', 'Phone', 'Tablet', 'Desktop', 'Vision'];
  const PRICES = ['All', 'Free', 'Paid', 'Subscription'];
  const SORTS = [{ id: 'rating', label: 'Top Rated' }, { id: 'downloads', label: 'Popular' }, { id: 'size', label: 'Smallest' }] as const;

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[20px] p-3 sm:p-4">
      {/* Fixed height row - prevents jump */}
      <div className="flex gap-2 h-[44px]">
        <div className="relative flex-1 h-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            placeholder="Search apps, creators, categories..."
            className="w-full h-full bg-[#0a0b18] border border-white/10 rounded-full pl-10 pr-10 text-[14px] focus:outline-none focus:border-indigo-500/50 focus:bg-[#0e0f22] transition placeholder:text-slate-500"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {localQuery && (
            <button onClick={() => { setLocalQuery(''); setSearchQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <button onClick={onOpenCommand} className="h-full px-3 bg-[#0a0b18] border border-white/10 rounded-full text-xs flex items-center gap-1.5 hover:bg-white/[0.06] transition shrink-0">
          <Command className="w-3.5 h-3.5" />K
        </button>
        <button onClick={() => setShowFilters(!showFilters)} className={`h-full px-4 rounded-full text-[13px] font-medium flex items-center gap-2 border transition shrink-0 ${showFilters || activeFilterCount ? 'bg-white text-black border-white' : 'bg-[#0a0b18] border-white/10 hover:bg-white/[0.06]'}`}>
          <SlidersHorizontal className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span> {activeFilterCount > 0 && <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Filters - fixed container, no layout shift */}
      <div className={`grid transition-all duration-300 ${showFilters ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-white/[0.06]' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="space-y-3 pb-1">
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat as CategoryType)} className={`whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-medium border transition shrink-0 ${selectedCategory === cat ? 'bg-white text-black border-white' : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'}`}>{cat}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {DEVICES.map(d => (<button key={d} onClick={() => setSelectedDevice(d as any)} className={`px-3 py-1.5 rounded-full text-[11px] border transition ${selectedDevice === d ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/[0.04] border-white/10'}`}>{d}</button>))}
              <div className="w-px h-5 bg-white/10 mx-1 self-center" />
              {PRICES.map(p => (<button key={p} onClick={() => setSelectedPriceModel(p)} className={`px-3 py-1.5 rounded-full text-[11px] border transition ${selectedPriceModel === p ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/[0.04] border-white/10'}`}>{p}</button>))}
              <div className="w-px h-5 bg-white/10 mx-1 self-center" />
              {SORTS.map(s => (<button key={s.id} onClick={() => setSortBy(s.id as any)} className={`px-3 py-1.5 rounded-full text-[11px] border transition ${sortBy === s.id ? 'bg-white text-black border-white' : 'bg-white/[0.04] border-white/10'}`}>{s.label}</button>))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-3">
        <Filter className="w-3 h-3" />{filteredCount} apps • {searchQuery ? `for "${searchQuery}"` : 'all categories'}
        {activeFilterCount > 0 && <button onClick={() => { setSelectedCategory('All' as any); setSelectedDevice('All' as any); setSelectedPriceModel('All'); setSortBy('rating'); }} className="ml-2 text-indigo-300 hover:text-indigo-200">Clear filters</button>}
      </div>
    </div>
  );
};