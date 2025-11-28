import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, Plus } from "lucide-react";
import { FileNode } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  onCreateFile: (parentPath: string, name: string, type: "file" | "folder") => void;
  activeFile: FileNode | null;
}

const FileExplorer = ({ files, onFileSelect, onCreateFile, activeFile }: FileExplorerProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/src"]));
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreate = () => {
    if (creatingIn && newItemName) {
      onCreateFile(creatingIn, newItemName, newItemType);
      setCreatingIn(null);
      setNewItemName("");
    }
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = activeFile?.path === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 px-2 py-1 hover:bg-accent cursor-pointer ${
            isActive ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === "folder" && (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Folder className="h-4 w-4 text-primary" />
            </>
          )}
          {node.type === "file" && <File className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm">{node.name}</span>
          {node.type === "folder" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setCreatingIn(node.path);
                setNewItemType("file");
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>

        {node.type === "folder" && isExpanded && node.children && (
          <>
            {node.children.map((child) => renderNode(child, depth + 1))}
            {creatingIn === node.path && (
              <div
                className="flex items-center gap-1 px-2 py-1"
                style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
              >
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as "file" | "folder")}
                  className="text-xs border rounded px-1"
                >
                  <option value="file">File</option>
                  <option value="folder">Folder</option>
                </select>
                <Input
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") setCreatingIn(null);
                  }}
                  placeholder="Name..."
                  className="h-6 text-xs"
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-card border-r border-border overflow-auto">
      <div className="p-2 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium">Explorer</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setCreatingIn("/");
            setNewItemType("file");
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-1">
        {files.map((file) => renderNode(file))}
        {creatingIn === "/" && (
          <div className="flex items-center gap-1 px-2 py-1">
            <select
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value as "file" | "folder")}
              className="text-xs border rounded px-1"
            >
              <option value="file">File</option>
              <option value="folder">Folder</option>
            </select>
            <Input
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setCreatingIn(null);
              }}
              placeholder="Name..."
              className="h-6 text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
