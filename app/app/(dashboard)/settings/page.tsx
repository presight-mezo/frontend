export default function SettingsPage() {
  return (
    <section className="p-8 animate-in fade-in duration-700">
      <div className="pb-2 border-b border-gray-100 mb-8">
        <h1 className="font-headline text-2xl font-bold tracking-tight text-black uppercase">Settings</h1>
        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Mandate management &amp; preferences</p>
      </div>
      <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed border-gray-200 text-gray-300">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl block mb-3" style={{ fontVariationSettings: "'wght' 200" }}>settings</span>
          <p className="text-sm font-bold">Settings coming soon</p>
        </div>
      </div>
    </section>
  );
}
