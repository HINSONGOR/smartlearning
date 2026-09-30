import Link from "next/link";

interface Props {
  href?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
  /** 未開放：顯示「即將推出」，唔可以撳 */
  disabled?: boolean;
  children?: React.ReactNode;
}

/** 大卡片按鈕，用喺各層選擇頁 */
export function NavCard({ href, title, subtitle, badge, icon, disabled, children }: Props) {
  const body = (
    <>
      <div className="flex items-start gap-3">
        {icon && (
          <span aria-hidden className="text-3xl leading-none">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-bold">{title}</span>
            {badge && (
              <span className="rounded-lg bg-primary-soft px-2 py-0.5 text-sm font-medium text-primary">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
        </div>
        {!disabled && (
          <span aria-hidden className="self-center text-2xl text-muted">
            ›
          </span>
        )}
      </div>
      {children}
    </>
  );
  const base = "block h-full rounded-3xl border p-5 md:p-6";

  if (disabled || !href) {
    return (
      <div aria-disabled className={`${base} border-dashed border-border opacity-60`}>
        {body}
      </div>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} border-border bg-surface transition hover:border-primary hover:bg-primary-soft`}
    >
      {body}
    </Link>
  );
}
