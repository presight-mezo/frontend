export default function GroupsPage() {
  return (
    <section className="p-8 animate-in fade-in duration-700">
      <div className="pb-2 border-b border-gray-100 mb-8">
        <h1 className="font-headline text-2xl font-bold tracking-tight text-black uppercase">My Groups</h1>
        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Create or join prediction groups</p>
      </div>
      <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed border-gray-200 text-gray-300">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl block mb-3" style={{ fontVariationSettings: "'wght' 200" }}>groups</span>
          <p className="text-sm font-bold">Groups coming soon</p>
        </div>
      </div>
    </section>
  );
}
