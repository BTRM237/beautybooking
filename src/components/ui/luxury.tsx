import Image from "next/image";
import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("container-custom", className)}>{children}</div>;
}

export function SectionWrapper({
  children,
  className,
  id,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "muted" | "gradient";
}) {
  return (
    <section
      id={id}
      className={cn(
        "section-padding relative overflow-hidden",
        variant === "muted" && "bg-[#0e080e]/55",
        variant === "gradient" && "luxury-gradient luxury-texture",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-14",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <GradientBadge className={align === "center" ? "mx-auto mb-4" : "mb-4"}>
          {eyebrow}
        </GradientBadge>
      )}
      <h2 className="text-[2.25rem] font-semibold leading-[1.05] text-[#f6eee8] md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-8 text-[#b8a8ae] md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

type LuxuryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  external?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
  className?: string;
};

export function LuxuryButton({
  href,
  external,
  variant = "primary",
  children,
  className,
  type = "button",
  ...props
}: LuxuryButtonProps) {
  const classes = cn(
    variant === "primary" && "btn-primary",
    variant === "secondary" && "btn-secondary",
    variant === "ghost" && "btn-ghost",
    className,
  );

  if (href) {
    if (external) {
      return (
        <a className={classes} href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }

    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}

export function GlassCard({
  children,
  className,
  as: Component = "div",
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  as?: "div" | "article" | "section" | "aside";
}) {
  return <Component className={cn("glass-card", className)}>{children}</Component>;
}

export function GradientBadge({
  children,
  className,
  icon: Icon = Flower2,
}: {
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-[#e8c7b0]/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-[#e8c7b0]",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </span>
  );
}

export function ImageCard({
  src,
  alt,
  className,
  imageClassName,
  priority,
  children,
  aspect = "aspect-[4/5]",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  children?: ReactNode;
  aspect?: string;
}) {
  return (
    <div className={cn("glass-card relative overflow-hidden rounded-3xl", aspect, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 45vw, 100vw"
        className={cn("object-cover transition-transform duration-700", imageClassName)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#120c12]/88 via-[#120c12]/12 to-transparent" />
      {children}
    </div>
  );
}

export function PricingCard({
  title,
  price,
  duration,
  includes,
  bestFor,
  href,
  featured,
}: {
  title: string;
  price: string;
  duration: string;
  includes: string[];
  bestFor?: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <GlassCard
      as="article"
      className={cn(
        "flex h-full flex-col p-6 md:p-7",
        featured && "border-[#e8c7b0]/45 bg-[linear-gradient(145deg,rgba(232,199,176,0.14),rgba(42,22,35,0.82))]",
      )}
    >
      {featured && (
        <span className="mb-5 w-fit rounded-full bg-[#e8c7b0] px-3 py-1 text-xs font-bold text-[#120c12]">
          Được chọn nhiều
        </span>
      )}
      <h3 className="text-2xl font-semibold text-[#f6eee8]">{title}</h3>
      {bestFor && <p className="mt-2 text-sm text-[#c98b9f]">{bestFor}</p>}
      <div className="mt-5 flex items-end gap-3">
        <p className="gradient-text text-3xl font-bold">{price}</p>
        <p className="pb-1 text-sm text-[#b8a8ae]">{duration}</p>
      </div>
      <ul className="mt-6 flex-1 space-y-3">
        {includes.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-[#d8cdd2]">
            <Check className="mt-1 h-4 w-4 shrink-0 text-[#c98b9f]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <LuxuryButton href={href} className="mt-7 w-full">
        Đặt lịch gói này <ArrowRight className="h-4 w-4" />
      </LuxuryButton>
    </GlassCard>
  );
}

export function TestimonialCard({
  name,
  service,
  comment,
  rating = 5,
}: {
  name: string;
  service?: string | null;
  comment: string;
  rating?: number;
}) {
  return (
    <GlassCard as="article" className="flex h-full flex-col p-6">
      <div className="mb-5 flex gap-1 text-[#e8c7b0]">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className={index < rating ? "opacity-100" : "opacity-25"}>
            ★
          </span>
        ))}
      </div>
      <p className="flex-1 text-sm leading-7 text-[#d8cdd2]">&ldquo;{comment}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3 border-t border-[#e8c7b0]/12 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8c7b0]/12 text-sm font-bold text-[#e8c7b0]">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-[#f6eee8]">{name}</p>
          {service && <p className="text-xs text-[#c98b9f]">{service}</p>}
        </div>
      </div>
    </GlassCard>
  );
}

export function BookingStepCard({
  step,
  title,
  description,
  icon: Icon,
}: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <GlassCard className="relative h-full overflow-hidden p-7">
      <div className="absolute right-5 top-4 font-heading text-6xl font-bold text-[#e8c7b0]/10">
        {step}
      </div>
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8c7b0]/12 text-[#e8c7b0]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-2xl font-semibold text-[#f6eee8]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#b8a8ae]">{description}</p>
    </GlassCard>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[#e8c7b0]/20 bg-white/[0.035] p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8c7b0]/12 text-[#e8c7b0]">
        <Flower2 className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-semibold text-[#f6eee8]">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#b8a8ae]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-400/12 text-amber-200 ring-amber-300/20",
  CONFIRMED: "bg-emerald-400/12 text-emerald-200 ring-emerald-300/20",
  COMPLETED: "bg-sky-400/12 text-sky-200 ring-sky-300/20",
  CANCELLED: "bg-rose-400/12 text-rose-200 ring-rose-300/20",
  NO_SHOW: "bg-slate-400/12 text-slate-200 ring-slate-300/20",
  ACTIVE: "bg-emerald-400/12 text-emerald-200 ring-emerald-300/20",
  INACTIVE: "bg-rose-400/12 text-rose-200 ring-rose-300/20",
  NEW: "bg-sky-400/12 text-sky-200 ring-sky-300/20",
  CONTACTED: "bg-amber-400/12 text-amber-200 ring-amber-300/20",
  WON: "bg-emerald-400/12 text-emerald-200 ring-emerald-300/20",
  LOST: "bg-rose-400/12 text-rose-200 ring-rose-300/20",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1",
        statusStyles[status] || "bg-white/8 text-[#d8cdd2] ring-white/10",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "rose",
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "rose" | "blue" | "green" | "amber";
}) {
  const tones = {
    rose: "text-[#e8c7b0] bg-[#e8c7b0]/10",
    blue: "text-sky-200 bg-sky-400/10",
    green: "text-emerald-200 bg-emerald-400/10",
    amber: "text-amber-200 bg-amber-400/10",
  };

  return (
    <div className="admin-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-bold text-white">{value}</p>
          {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
