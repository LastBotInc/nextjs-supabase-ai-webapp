import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const PageWrapper = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <main className={cn("flex min-h-screen flex-col items-center bg-white", className)}>{children}</main>;
};
