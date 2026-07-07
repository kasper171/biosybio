import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type BiosyToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  variant?: "switch" | "checkbox";
  className?: string;
  "aria-label"?: string;
};

export function BiosyToggle({
  checked,
  onChange,
  disabled,
  variant = "switch",
  className,
  "aria-label": ariaLabel,
}: BiosyToggleProps) {
  const toggle = () => {
    if (!disabled) onChange(!checked);
  };

  if (variant === "checkbox") {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        data-checked={checked}
        onClick={toggle}
        className={cn(
          "biosy-toggle-checkbox group relative grid h-6 w-6 shrink-0 place-items-center rounded-[9px] outline-none",
          "transition-[transform,filter] duration-200 ease-out",
          "focus-visible:ring-2 focus-visible:ring-pink-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e13]",
          "active:scale-[0.92] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
          checked
            ? "bg-gradient-to-b from-pink-300 via-pink-500 to-rose-700 shadow-[0_4px_0_#831843,0_8px_20px_rgba(236,72,153,0.28),inset_0_1px_0_rgba(255,255,255,0.45)]"
            : "bg-gradient-to-b from-zinc-500/35 to-zinc-800/70 shadow-[0_4px_0_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)]",
          !disabled && "hover:brightness-110",
          className,
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-[3px] rounded-[6px] transition-opacity",
            checked
              ? "bg-gradient-to-b from-white/25 to-transparent opacity-100"
              : "bg-gradient-to-b from-white/10 to-transparent opacity-60",
          )}
        />
        <motion.span
          initial={false}
          animate={
            checked
              ? { scale: 1, opacity: 1, rotate: 0 }
              : { scale: 0.35, opacity: 0, rotate: -12 }
          }
          transition={{ type: "spring", stiffness: 560, damping: 26 }}
          className="pointer-events-none relative z-[1]"
        >
          <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" strokeWidth={3.25} />
        </motion.span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      data-checked={checked}
      onClick={toggle}
      className={cn(
        "biosy-toggle-switch relative h-7 w-[46px] shrink-0 rounded-full p-[3px] outline-none",
        "transition-[box-shadow,filter] duration-300 ease-out",
        "focus-visible:ring-2 focus-visible:ring-pink-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e13]",
        "disabled:cursor-not-allowed disabled:opacity-45",
        checked
          ? "bg-gradient-to-b from-pink-300 via-pink-500 to-rose-700 shadow-[inset_0_2px_5px_rgba(0,0,0,0.22),0_0_18px_rgba(236,72,153,0.32)]"
          : "bg-gradient-to-b from-white/20 to-white/[0.06] shadow-[inset_0_3px_9px_rgba(0,0,0,0.48)]",
        !disabled && "hover:brightness-110",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-2 top-[5px] h-[6px] rounded-full transition-opacity",
          checked ? "bg-white/25 opacity-100" : "bg-white/10 opacity-50",
        )}
      />
      <motion.span
        layout
        initial={false}
        animate={{ x: checked ? 19 : 0 }}
        transition={{ type: "spring", stiffness: 540, damping: 30 }}
        className={cn(
          "relative block h-[22px] w-[22px] rounded-full",
          "bg-gradient-to-b from-white via-gray-50 to-gray-200",
          "shadow-[0_3px_0_rgba(0,0,0,0.16),0_5px_10px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.95)]",
          !disabled && "group-active:shadow-[0_1px_0_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.95)]",
        )}
      >
        <span
          aria-hidden
          className="absolute left-[5px] top-[4px] h-[7px] w-[10px] rounded-full bg-white/70 blur-[1px]"
        />
      </motion.span>
    </button>
  );
}
