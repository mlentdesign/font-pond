import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: "24px" }}>
      <ol className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
        <li>
          <Link href="/" className="hover:text-neutral-600 transition-colors">
            Results
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={i} className={i === crumbs.length - 1 ? "text-neutral-600" : ""}>
            <span aria-hidden="true" className="text-neutral-400" style={{ marginRight: "8px" }}>/</span>
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-neutral-600 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              crumb.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
