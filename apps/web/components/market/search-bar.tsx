export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block px-4 pb-4">
      <span className="sr-only">Поиск токенов</span>
      <input
        className="input-field"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Поиск по названию или тикеру"
        type="search"
        value={value}
      />
    </label>
  );
}
