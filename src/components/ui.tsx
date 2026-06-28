import Link from "next/link";

export function BigButton({
  href,
  onClick,
  type = "button",
  variant = "primary",
  children,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "outline" | "danger";
  children: React.ReactNode;
  className?: string;
}) {
  const base =
    "block w-full rounded-2xl px-6 py-4 text-center text-lg font-bold transition active:scale-[0.98]";
  const variants = {
    primary: "bg-hethu-red text-white shadow-lg hover:bg-hethu-red-dark",
    secondary: "bg-white text-hethu-red border-2 border-hethu-red",
    outline: "bg-transparent text-gray-700 border-2 border-gray-300",
    danger: "bg-red-100 text-red-700 border-2 border-red-300",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="bg-hethu-red px-4 pb-6 pt-8 text-white">
      {backHref && (
        <Link href={backHref} className="mb-3 inline-block text-sm text-white/80">
          ← Back
        </Link>
      )}
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-white/90">{subtitle}</p>}
    </header>
  );
}

export function formatPrice(cents: number): string {
  return `R${(cents / 100).toFixed(0)}`;
}
