import type { CheckboxProps } from "./Checkbox.types";

export default function Checkbox({
  checked,
  onChange,
  label,
}: CheckboxProps) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}