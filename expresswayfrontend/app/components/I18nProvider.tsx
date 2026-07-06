"use client";

import "@/i18n/i18n"; // Import file cấu hình của bạn
import { ReactNode } from "react";

export default function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}