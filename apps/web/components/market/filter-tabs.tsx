const filters = ["Тренд", "Новые", "Почти", "Вышли", "Объём"];

export function FilterTabs() {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-4">
      {filters.map((filter, index) => (
        <button
          key={filter}
          className={
            index === 0
              ? "shrink-0 rounded-full bg-[#0088cc] px-4 py-2 text-sm font-semibold text-white"
              : "shrink-0 rounded-full border border-[#1e3a5f] bg-[#1a2235] px-4 py-2 text-sm text-[#8ba3c1]"
          }
          type="button"
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
