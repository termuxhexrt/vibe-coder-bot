import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileNode } from "@/pages/Index";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AgentChatProps {
  fileTree: FileNode[];
  onFileUpdate: (path: string, content: string) => void;
  onCreateFile: (parentPath: string, name: string, type: "file" | "folder") => void;
  onTerminalOutput: (output: string) => void;
}

const AgentChat = ({ fileTree, onFileUpdate, onCreateFile, onTerminalOutput }: AgentChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI coding agent. I can help you write code, debug, architect solutions, and more. What would you like to build?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("agent-chat", {
        body: {
          messages: [...messages, userMessage],
          fileTree: JSON.stringify(fileTree),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Handle agent actions
      if (data.actions) {
        data.actions.forEach((action: any) => {
          if (action.type === "create_file") {
            onCreateFile(action.parentPath, action.name, "file");
            onTerminalOutput(`Agent created file: ${action.parentPath}/${action.name}`);
          } else if (action.type === "update_file") {
            onFileUpdate(action.path, action.content);
            onTerminalOutput(`Agent updated file: ${action.path}`);
          }
        });
      }
    } catch (error: any) {
      console.error("Agent error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to communicate with agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-card border-l border-border flex flex-col">
      <div className="px-3 py-2 border-b border-border bg-accent/50">
        <span className="text-xs font-medium">AI Agent</span>
      </div>

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-8"
                  : "bg-muted mr-8"
              }`}
            >
              <div className="font-semibold text-xs mb-1 opacity-70">
                {msg.role === "user" ? "You" : "Agent"}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Agent is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask the agent to code something..."
            disabled={isLoading}
            className="text-sm"
          />
          <Button onClick={handleSend} disabled={isLoading} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
