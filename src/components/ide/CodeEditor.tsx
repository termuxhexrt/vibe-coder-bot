import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { FileNode } from "@/pages/Index";

interface CodeEditorProps {
  file: FileNode | null;
  onContentChange: (path: string, content: string) => void;
}

const CodeEditor = ({ file, onContentChange }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const getLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      py: "python",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      txt: "plaintext",
    };
    return langMap[ext || ""] || "plaintext";
  };

  return (
    <div className="h-full bg-background">
      {file ? (
        <Editor
          height="100%"
          language={getLanguage(file.name)}
          value={file.content || ""}
          onChange={(value) => {
            if (value !== undefined && file.path) {
              onContentChange(file.path, value);
            }
          }}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            rulers: [],
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">No file selected</p>
            <p className="text-sm">Select a file from the explorer or chat with the AI agent</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
