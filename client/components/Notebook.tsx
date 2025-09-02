import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export default function Notebook(
  props: PropsWithChildren<{ className?: string; noMarginLines?: boolean; innerClassName?: string }>,
) {
  const { className, noMarginLines, innerClassName, children } = props;
  return (
    <div className={cn("notebook-paper overflow-hidden", className)}>
      <div className={cn("notebook-inner flex flex-col", noMarginLines && "no-margin-lines", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
