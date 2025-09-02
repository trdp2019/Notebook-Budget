import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
}

export function AnimatedTabs({ tabs, defaultValue, className }: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);
  const [direction, setDirection] = useState(0);

  const activeTabIndex = tabs.findIndex(tab => tab.value === activeTab);

  const handleTabChange = (newTab: string) => {
    const newIndex = tabs.findIndex(tab => tab.value === newTab);
    setDirection(newIndex > activeTabIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  return (
    <div className={cn("w-full flex flex-col", className)}>
      {/* Tab List - Notebook style */}
      <div className="flex gap-6 font-hand justify-center items-center mx-auto mb-[30px]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              "text-lg underline transition-all focus:outline-none",
              activeTab === tab.value
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content with page turn effect */}
      <div className="relative overflow-hidden" style={{ perspective: "1000px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{
              rotateY: direction > 0 ? 45 : -45,
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              rotateY: 0,
              opacity: 1,
              scale: 1
            }}
            exit={{
              rotateY: direction > 0 ? -45 : 45,
              opacity: 0,
              scale: 0.95
            }}
            transition={{
              type: "spring",
              damping: 35,
              stiffness: 400,
              mass: 0.5
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {tabs.find(tab => tab.value === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
