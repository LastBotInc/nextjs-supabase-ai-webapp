import { ReactNode } from "react";
import { cssJs, getClassesAsString } from "../cssJs/cssJs";
import { cn } from "@/lib/utils";

export const PageWrapper = ({ children, className }: { children: ReactNode; className?: string }) => {
  const classes = getClassesAsString({ source: cssJs.page, omitKeys: ["hoistBottomGap", "hoistTopGap"] });
  return <main className={cn("flex min-h-screen flex-col items-center bg-white", classes, className)}>{children}</main>;
};
