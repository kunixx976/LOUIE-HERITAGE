const apparelRows = [
  ["XS", "82–86", "62–66", "88–92"],
  ["S", "86–90", "66–70", "92–96"],
  ["M", "90–96", "70–76", "96–102"],
  ["L", "96–102", "76–82", "102–108"],
  ["XL", "102–110", "82–90", "108–116"],
];

const denimRows = [
  ["28", "71–73", "88–91"],
  ["30", "76–78", "93–96"],
  ["32", "81–83", "98–101"],
  ["34", "86–88", "103–106"],
  ["36", "91–93", "108–111"],
  ["38", "96–98", "113–116"],
];

type SizeGuideTableProps = {
  kind: "apparel" | "denim";
  sizes?: string[];
};

export function SizeGuideTable({ kind, sizes }: SizeGuideTableProps) {
  const isDenim = kind === "denim";
  const rows = (isDenim ? denimRows : apparelRows).filter(
    (row) => !sizes || sizes.includes(row[0]!),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[24rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {(isDenim
              ? ["Waist size (in)", "Body waist (cm)", "Body hip (cm)"]
              : ["Size", "Chest (cm)", "Waist (cm)", "Hip (cm)"]
            ).map((heading) => (
              <th key={heading} className="py-2 pr-4 font-medium last:pr-0">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-border last:border-0">
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className="py-2.5 pr-4 last:pr-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={isDenim ? 3 : 4} className="py-4 text-muted-foreground">
                Please refer to the sizes available on this product.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
