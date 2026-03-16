"use client";

import { useState, useEffect, useMemo } from "react";
import namesData from "@/data/names.json";
import { Search, Heart, X, Copy, Check } from "lucide-react";

// Update type inline since we are not using search.ts
export interface AllahName {
  id: number;
  name: string;
  arabic: string;
  categories: string[];
  intents?: string[];
  meaningBlocks: string[];
  dua: string;
  meaning: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  // Now support multiple selection
  const [activeIntents, setActiveIntents] = useState<string[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [viewingFavorites, setViewingFavorites] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedName, setSelectedName] = useState<AllahName | null>(null);
  const [copied, setCopied] = useState(false);
  const [howToOpen, setHowToOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("duaFavorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(f => f !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem("duaFavorites", JSON.stringify(newFavs));
  };

  const copyToClipboard = () => {
    if (!selectedName) return;
    const textToCopy = `Dua for ${selectedName.name} (${selectedName.meaning}):\n\n"${selectedName.dua}"\n\n-- From Duaa Connect`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allNames = namesData as AllahName[];
  
  // Extract all unique intents
  const uniqueIntents = useMemo(() => {
    const intents = new Set<string>();
    allNames.forEach(n => (n.intents || []).forEach(i => intents.add(i)));
    return Array.from(intents).sort();
  }, [allNames]);

  // Extract all unique categories
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    allNames.forEach(n => n.categories.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [allNames]);

  // Filter names
  const filteredNames = useMemo(() => {
    let filtered = allNames;
    if (viewingFavorites) {
      filtered = filtered.filter(n => favorites.includes(n.id));
    } else {
      if (activeIntents.length > 0) {
        filtered = filtered.filter(n => 
          activeIntents.some(intent => (n.intents || []).includes(intent))
        );
      }
      if (activeCategories.length > 0) {
        filtered = filtered.filter(n => 
          activeCategories.some(cat => n.categories.includes(cat))
        );
      }
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        filtered = filtered.filter(n => 
          n.name.toLowerCase().includes(lowerQ) ||
          n.meaning.toLowerCase().includes(lowerQ) ||
          n.categories.some(c => c.toLowerCase().includes(lowerQ)) ||
          n.dua.toLowerCase().includes(lowerQ) ||
          (n.meaningBlocks && n.meaningBlocks.some(b => b.toLowerCase().includes(lowerQ))) ||
          (n.intents && n.intents.some(i => i.toLowerCase().includes(lowerQ)))
        );
      }
    }
    return filtered;
  }, [allNames, searchQuery, activeIntents, activeCategories, viewingFavorites, favorites]);

  const toggleIntent = (intent: string) => {
    setActiveIntents(prev => 
      prev.includes(intent) ? prev.filter(i => i !== intent) : [...prev, intent]
    );
  };

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearAllFilters = () => {
    setActiveIntents([]);
    setActiveCategories([]);
    setSearchQuery("");
    setViewingFavorites(false);
  };

  const hasAnyFilter = activeIntents.length > 0 || activeCategories.length > 0 || searchQuery || viewingFavorites;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#333333] font-sans antialiased flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 text-[#2d6a4f] font-bold text-xl cursor-pointer" onClick={clearAllFilters}>
              <span className="text-2xl text-[#d4af37]">✨</span> Name & Need | Duaa & Allah Discovery Tool
            </div>
            <div>
              <button 
                onClick={() => { setViewingFavorites(!viewingFavorites); setActiveIntents([]); setActiveCategories([]); }}
                className={`px-3 py-2 rounded-md font-medium flex items-center gap-2 transition-colors ${viewingFavorites ? 'bg-[#2d6a4f] text-white' : 'text-[#2d6a4f] hover:text-[#1b4332]'}`}
              >
                <Heart className={`w-5 h-5 ${viewingFavorites ? 'fill-current' : ''}`} /> My Duas
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8">
        
        {/* Intro & Search */}
        {!viewingFavorites && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Supplication</h1>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, feeling, or need (e.g., 'Healing', 'Lost')..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent shadow-sm text-lg bg-white"
                />
              </div>

              {/* Islamic Quote */}
              <div className="mt-6 p-6 bg-[#f2f7f4] rounded-xl border border-[#2d6a4f]/20 text-center">
                <p className="font-arabic text-2xl text-[#1b4332] mb-4 leading-relaxed tracking-wide">
                  قُلِ ٱدْعُوا۟ ٱللَّهَ أَوِ ٱدْعُوا۟ ٱلرَّحْمَـٰنَ ۖ أَيًّۭا مَّا تَدْعُوا۟ فَلَهُ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ ۚ وَلَا تَجْهَرْ بِصَلَاتِكَ وَلَا تُخَافِتْ بِهَا وَٱبْتَغِ بَيْنَ ذَٰلِكَ سَبِيلًۭا ١١٠
                </p>
                <p className="text-sm text-gray-700 italic mb-2">
                  Say, ˹O Prophet,˺ "Call upon Allah or call upon the Most Compassionate—whichever you call, He has the Most Beautiful Names." Do not recite your prayers too loudly or silently, but seek a way between.
                </p>
                <a href="https://quran.com/17/110" target="_blank" rel="noopener noreferrer" className="text-xs text-[#2d6a4f] hover:underline font-medium">
                  The Night Journey (17:110)
                </a>
              </div>
            </div>

            {/* How To Use — collapsible */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setHowToOpen(o => !o)}
                className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  💡 How To Find the Name & Duaa You Need
                </span>
                <span className={`text-gray-400 transition-transform duration-200 ${howToOpen ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>

              {howToOpen && (
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center p-4 bg-[#f2f7f4] rounded-xl">
                    <div className="text-4xl mb-3">🔍</div>
                    <div className="w-7 h-7 rounded-full bg-[#2d6a4f] text-white text-sm font-bold flex items-center justify-center mb-3">1</div>
                    <h4 className="font-bold text-gray-800 mb-2">Search or Filter</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Use the search bar or tap an intent filter (like <em>"Healing"</em> or <em>"Guidance"</em>) to discover which of Allah's Beautiful Names speaks to your current need.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center p-4 bg-[#f2f7f4] rounded-xl">
                    <div className="text-4xl mb-3">🤍</div>
                    <div className="w-7 h-7 rounded-full bg-[#2d6a4f] text-white text-sm font-bold flex items-center justify-center mb-3">2</div>
                    <h4 className="font-bold text-gray-800 mb-2">Save a Name</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Click any name card to read its meaning and personal duaa. Tap the <span className="text-red-500 font-bold">♥</span> heart to save it — build your own curated collection of supplications.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center p-4 bg-[#f2f7f4] rounded-xl">
                    <div className="text-4xl mb-3">🤲</div>
                    <div className="w-7 h-7 rounded-full bg-[#2d6a4f] text-white text-sm font-bold flex items-center justify-center mb-3">3</div>
                    <h4 className="font-bold text-gray-800 mb-2">Pray with Focus</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Tap <strong>My Duas</strong> in the top right. Your saved duas are listed out in full — scroll through and recite them during your prayer or quiet reflection.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Intent Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Intent Filters</h3>
              <div className="grid grid-rows-2 grid-flow-col gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {uniqueIntents.map(intent => (
                  <button
                    key={intent}
                    onClick={() => toggleIntent(intent)}
                    className={`whitespace-nowrap px-4 py-2 flex-shrink-0 rounded-full border text-sm font-medium transition-colors ${
                      activeIntents.includes(intent)
                        ? 'bg-[#2d6a4f] text-white border-[#2d6a4f] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#2d6a4f] hover:text-[#2d6a4f]'
                    }`}
                  >
                    {intent}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Divine Attribute Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {uniqueCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      activeCategories.includes(cat)
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#1b4332] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#d4af37] hover:bg-[#fafafa]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">
              {viewingFavorites ? `My Favorites (${filteredNames.length})` : `Found ${filteredNames.length} Names`}
            </h3>
            {hasAnyFilter && (
              <button 
                onClick={clearAllFilters}
                className="text-sm text-[#2d6a4f] hover:underline"
              >
                Clear Filters ✕
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNames.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <span className="text-4xl text-gray-300 block mb-2">👀</span>
                <p className="text-gray-500 font-medium">No names found matching your criteria.</p>
                <button onClick={clearAllFilters} className="mt-2 text-[#2d6a4f] hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredNames.map(item => {
                const isFav = favorites.includes(item.id);
                // Subtle category coloring based on first category
                return (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedName(item)}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between group relative overflow-hidden h-full"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#f2f7f4] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-3xl z-0"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded bg-[#f2f7f4] text-[#2d6a4f] line-clamp-1 max-w-[80%]">
                          {item.categories[0] || "Attribute"}
                        </span>
                        <button 
                          onClick={(e) => toggleFavorite(item.id, e)}
                          className={`text-xl transition-transform hover:scale-110 ${isFav ? 'text-red-500' : 'text-gray-300'}`}
                        >
                          <Heart className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{item.name}</h2>
                      <p className="text-[#1b4332] mb-4 text-sm font-medium min-h-[40px]">{item.meaning}</p>
                    </div>
                    <div className="relative z-10 mt-auto pt-2">
                      <div className="flex flex-wrap gap-1">
                        {(item.intents || []).slice(0, 3).map(intent => (
                          <span key={intent} className="text-xs bg-gray-50 border border-gray-200 text-gray-500 px-2 py-1 rounded">{intent}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* My Duaas List View */}
        {viewingFavorites && filteredNames.length > 0 && (
          <div className="flex flex-col gap-6 mt-8">
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
                My Duaas
              </h2>
              <div className="flex flex-col gap-6">
                {filteredNames.map(item => (
                  <div key={`dua-${item.id}`} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                        <p className="text-[#2d6a4f] font-medium">{item.meaning}</p>
                      </div>
                      <span className="font-arabic text-2xl text-[#1b4332]">{item.arabic}</span>
                    </div>
                    <div className="bg-[#fafafa] p-4 rounded-lg border-l-4 border-[#d4af37]">
                      <p className="text-gray-800 text-lg leading-relaxed italic">"{item.dua}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built with spiritual serenity in mind. May Allah accept our duas.</p>
        </div>
      </footer>

      {/* Modal */}
      {selectedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 overflow-hidden transition-opacity" onClick={() => setSelectedName(null)}></div>
          <div className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-2xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#2d6a4f] text-white p-6 rounded-t-2xl flex justify-between items-start shrink-0">
              <div>
                <p className="text-[#d4af37] text-sm font-bold uppercase tracking-wider mb-1 line-clamp-1">
                  {selectedName.categories.join(' & ')}
                </p>
                <h2 className="text-3xl font-bold">{selectedName.name}</h2>
                <p className="text-[#f2f7f4] text-lg mt-1">{selectedName.meaning}</p>
              </div>
              <button 
                onClick={() => setSelectedName(null)} 
                className="text-white hover:text-[#d4af37] transition-colors leading-none ml-4"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 flex-grow overflow-y-auto">
              {/* Arabic */}
              <div className="mb-8 font-arabic text-[#1b4332] text-center">
                <p className="text-4xl leading-relaxed">{selectedName.arabic}</p>
              </div>

              {/* Explanation / Root */}
              {selectedName.meaningBlocks && selectedName.meaningBlocks.length > 0 && (
                <div className="mb-8 bg-[#fafafa] p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-[#2d6a4f]">📖</span> Meaning & Context
                  </h4>
                  <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                    {selectedName.meaningBlocks.map((block, i) => (
                      <p key={i}>{block}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* The Dua */}
              <div>
                <h4 className="font-bold text-[#1b4332] mb-3 text-xl border-b pb-2">Your Supplication</h4>
                <p className="text-gray-800 text-lg leading-relaxed italic border-l-4 border-[#d4af37] pl-4">
                  "{selectedName.dua}"
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 rounded-b-2xl flex flex-wrap justify-between items-center gap-4 shrink-0">
              <button 
                onClick={() => toggleFavorite(selectedName.id)}
                className={`flex items-center justify-center flex-1 sm:flex-none gap-2 font-medium px-4 py-2 rounded-lg border shadow-sm transition-colors ${
                  favorites.includes(selectedName.id) 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-white border-gray-200 text-gray-600 hover:text-[#2d6a4f]'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(selectedName.id) ? 'fill-current' : ''}`} />
                {favorites.includes(selectedName.id) ? 'Favorited' : 'Favorite'}
              </button>
              <button 
                onClick={copyToClipboard}
                className={`flex items-center justify-center flex-1 sm:flex-none gap-2 text-white font-medium px-5 py-2 rounded-lg shadow-sm transition-colors ${
                  copied ? 'bg-green-600 border-transparent hover:bg-green-700' : 'bg-[#2d6a4f] hover:bg-[#1b4332]'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Dua'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
