export default function CategoryTabs({ categories, active, onChange, favCount }) {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'fav', label: `Favorites (${favCount})` },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

  return (
    <div className="tabs" role="tablist" aria-label="Menu categories">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`tab ${active === t.id ? 'on' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
