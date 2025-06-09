import { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * PageWrapper is a component that is used wrap page contents
 * Example:
 * <PageWrapper>
 *   <FlexLayout>
 *     <FlexLayout.Column>
 *       <Heading2>Heading</Heading2>
 *       <Paragraph>Paragraph</Paragraph>
 *     </FlexLayout.Column>
 *   </FlexLayout>
 * </PageWrapper>
 * @param children - The children of the page.
 * @param className - The className of the page.
 * @returns A div element with a page.
 */
export const PageWrapper = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <main className={cn("flex min-h-screen flex-col items-center bg-white", className)}>{children}</main>;
};
