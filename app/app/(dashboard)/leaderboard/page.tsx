export default function LeaderboardPage() {
  return (
    <section className="p-8 animate-in fade-in duration-700">
      <div className="pb-2 border-b border-gray-100 mb-8">
        <h1 className="font-headline text-2xl font-bold tracking-tight text-black uppercase">Leaderboard</h1>
        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Conviction Score rankings</p>
      </div>
      <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed border-gray-200 text-gray-300">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl block mb-3" style={{ fontVariationSettings: "'wght' 200" }}>emoji_events</span>
          <p className="text-sm font-bold">Leaderboard coming soon</p>
        </div>
      </div>
    </section>
  );
}
