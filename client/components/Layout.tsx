import { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps extends PropsWithChildren {
  headerRight?: ReactNode;
  className?: string;
}

export default function Layout({ headerRight, children, className }: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-paper grid grid-rows-[auto,1fr]", className)}>
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b">
        <div className="container mx-auto flex items-center justify-between py-3">
          <a className="text-2xl font-bold font-hand tracking-[2px]" href="/">Notebook Budget</a>
          <nav className="flex items-center gap-1">
            <Button asChild variant="ghost" className="font-hand text-[20px] leading-5 font-medium">
              <a href="/">Home</a>
            </Button>
            <Button asChild variant="ghost" className="font-hand text-[20px] leading-5 font-medium">
              <a href="/budget-planning">Budget</a>
            </Button>
            <Button asChild variant="ghost" className="font-hand text-[20px] leading-5 font-medium">
              <a href="/analytics">Analytics</a>
            </Button>
            <Button asChild variant="ghost" className="font-hand text-[20px] leading-5 font-medium">
              <a href="/settings">Settings</a>
            </Button>
          </nav>
          <div className="flex items-center gap-3">{headerRight}</div>
        </div>
      </header>
      <main className="w-full mx-auto px-8 py-6">{children}</main>
    </div>
  );
}
