import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HeaderAction = {
  label: string;
  href: string;
  primary?: boolean;
};

export default function CompactPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: HeaderAction[];
}) {
  return (
    <section className="border-b border-[#f3a38f]/10 bg-[#070509] py-5 md:py-9">
      <div className="container-custom flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wide text-[#bd7b6c]">{eyebrow}</p>
          <h1 className="mt-1.5 font-heading text-3xl font-medium leading-tight text-[#f7e8e2] md:mt-2 md:text-5xl">
            {title}
          </h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#cdbab4] md:mt-3 md:text-base md:leading-7">{description}</p>}
        </div>

        {actions?.length ? (
          <div className={cn("grid gap-2 sm:flex sm:flex-wrap sm:gap-3", actions.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn(action.primary ? "btn-primary" : "btn-secondary", "w-full text-xs uppercase sm:w-auto")}
              >
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
