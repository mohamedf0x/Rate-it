export default function StarRating({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <span className="inline-flex items-center gap-1 text-sm" dir="ltr">
      <span className="text-amber-500">
        {"★".repeat(Math.floor(rounded))}
        {rounded % 1 ? "½" : ""}
        <span className="text-neutral-300">{"★".repeat(5 - Math.ceil(rounded))}</span>
      </span>
      <span className="text-neutral-600">{value.toFixed(1)}</span>
      {count !== undefined ? <span className="text-neutral-400">({count})</span> : null}
    </span>
  );
}
