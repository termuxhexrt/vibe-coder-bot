import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import FileExplorer from "@/components/ide/FileExplorer";
import CodeEditor from "@/components/ide/CodeEditor";
import AgentChat from "@/components/ide/AgentChat";
import Terminal from "@/components/ide/Terminal";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileNode[];
}

const Index = () => {
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      name: "src",
      type: "folder",
      path: "/src",
      children: [
        {
          name: "index.js",
          type: "file",
          path: "/src/index.js",
          content: "console.log('Hello from VibeCode AI!');\n\n// Start coding...",
        },
      ],
    },
    {
      name: "README.md",
      type: "file",
      path: "/README.md",
      content: "# VibeCode AI Project\n\nBuilt with AI agents",
    },
  ]);

  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "VibeCode AI Terminal v1.0.0",
    "Ready to execute code...",
  ]);

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      setActiveFile(file);
    }
  };

  const handleFileUpdate = (path: string, content: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === path) {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setFileTree(updateNode(fileTree));
    if (activeFile?.path === path) {
      setActiveFile({ ...activeFile, content });
    }
  };

  const handleCreateFile = (parentPath: string, name: string, type: "file" | "folder") => {
    const newNode: FileNode = {
      name,
      type,
      path: `${parentPath}/${name}`,
      content: type === "file" ? "" : undefined,
      children: type === "folder" ? [] : undefined,
    };

    const addNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === parentPath && node.type === "folder") {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        }
        if (node.children) {
          return { ...node, children: addNode(node.children) };
        }
        return node;
      });
    };

    setFileTree(addNode(fileTree));
  };

  const handleExecuteCode = () => {
    if (!activeFile || activeFile.type !== "file") return;

    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.join(" "));
        originalLog(...args);
      };

      if (activeFile.path.endsWith(".js")) {
        eval(activeFile.content || "");
      }

      console.log = originalLog;
      setTerminalOutput([
        ...terminalOutput,
        `\n> Executing ${activeFile.name}...`,
        ...logs,
        "Execution complete.",
      ]);
    } catch (error: any) {
      setTerminalOutput([
        ...terminalOutput,
        `\n> Error executing ${activeFile.name}:`,
        error.message,
      ]);
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      <header className="h-12 border-b border-border flex items-center px-4 bg-card">
        <h1 className="text-lg font-semibold">VibeCode AI</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleExecuteCode}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Run Code
          </button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileExplorer
            files={fileTree}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
            activeFile={activeFile}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={30}>
              <CodeEditor
                file={activeFile}
                onContentChange={handleFileUpdate}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={30} minSize={20}>
              <Terminal output={terminalOutput} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={30} minSize={20}>
          <AgentChat
            fileTree={fileTree}
            onFileUpdate={handleFileUpdate}
            onCreateFile={handleCreateFile}
            onTerminalOutput={(output) => setTerminalOutput([...terminalOutput, output])}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
