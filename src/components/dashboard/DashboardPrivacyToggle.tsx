import { BiosyToggle } from "@/components/ui/BiosyToggle";
import { cn } from "@/lib/utils";

export function DashboardPrivacyToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-all duration-200",
        "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]",
        checked && "border-pink-500/25 bg-pink-500/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
      )}
    >
      <span>
        <span
          className={cn(
            "block text-sm font-medium transition-colors",
            checked ? "text-white" : "text-white/90",
          )}
        >
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-white/40">{description}</span>
      </span>
      <BiosyToggle
        checked={checked}
        onChange={onChange}
        variant="switch"
        aria-label={label}
        className="mt-0.5"
      />
    </label>
  );
}
