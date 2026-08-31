import { ReactNode } from "react";

export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
}