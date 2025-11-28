import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TerminalProps {
  output: string[];
}

const Terminal = ({ output }: TerminalProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full bg-card border-t border-border flex flex-col">
      <div className="px-3 py-2 border-b border-border bg-accent/50">
        <span className="text-xs font-medium">Terminal</span>
      </div>
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 font-mono text-xs space-y-1">
          {output.map((line, i) => (
            <div key={i} className="text-foreground/80">
              {line}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Terminal;
