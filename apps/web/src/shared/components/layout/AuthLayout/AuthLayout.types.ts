import { ReactNode } from "react";
import type { AuthBrandingProps } from "@/features/auth/components/AuthBranding/AuthBranding.types";

export interface AuthLayoutProps {
  children: ReactNode;
  branding: AuthBrandingProps;
}