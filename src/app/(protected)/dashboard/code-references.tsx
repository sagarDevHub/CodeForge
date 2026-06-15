"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  filesReferences: {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];
};

const CodeReferences = ({ filesReferences }: Props) => {
  const [activeTab, setActiveTab] = React.useState("");

  React.useEffect(() => {
    if (filesReferences.length > 0) {
      setActiveTab(filesReferences[0]?.fileName ?? "");
    }
  }, [filesReferences]);

  const selectedFile = filesReferences.find(
    (file) => file.fileName === activeTab,
  );

  if (filesReferences.length === 0) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Tab Navigation row */}
      <div className="bg-muted/40 flex scrollbar-none items-center gap-1.5 overflow-x-auto border-b p-2">
        {filesReferences.map((file) => {
          const isSelected = activeTab === file.fileName;
          return (
            <button
              key={file.fileName}
              onClick={() => setActiveTab(file.fileName)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
                isSelected
                  ? "bg-background border-border text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent bg-transparent",
              )}
            >
              {file.fileName.split("/").pop()}
            </button>
          );
        })}
      </div>

      {/* Code Viewer Body Area */}
      {selectedFile && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Breadcrumb Path Info */}
          <div className="bg-muted/10 text-muted-foreground border-b bg-zinc-50/50 px-4 py-2 font-mono text-xs dark:bg-transparent">
            {selectedFile.fileName}
          </div>

          {/* Dedicated Scrolling Source Highlighter area */}
          <div className="flex-1 scrollbar-thin overflow-auto bg-zinc-50/30 text-xs">
            <SyntaxHighlighter
              language="typescript"
              style={oneLight}
              customStyle={{
                margin: 0,
                padding: "1.25rem",
                borderRadius: 0,
                fontSize: "12.5px",
                lineHeight: "1.6",
                background: "transparent",
              }}
            >
              {selectedFile.sourceCode}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeReferences;
