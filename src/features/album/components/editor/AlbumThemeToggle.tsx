import { BiosyToggle } from "@/components/ui/BiosyToggle";

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  variant?: "switch" | "checkbox";
  disabled?: boolean;
};

export function AlbumThemeToggle({
  label,
  checked,
  onChange,
  description,
  variant = "switch",
  disabled,
}: Props) {
  return (
    <div className="album-theme-toggle-row">
      <div className="album-theme-toggle-row__text">
        <span className="album-theme-toggle-row__label">{label}</span>
        {description ? <span className="album-theme-toggle-row__desc">{description}</span> : null}
      </div>
      <BiosyToggle
        checked={checked}
        onChange={onChange}
        variant={variant}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}
