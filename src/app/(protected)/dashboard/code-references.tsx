"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // Using a dark theme matching your screenshot example

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
      setActiveTab(filesReferences[0]!.fileName);
    }
  }, [filesReferences]);

  const selectedFile = filesReferences.find(
    (file) => file.fileName === activeTab,
  );

  if (filesReferences.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      {/* Tab bar header block layout */}
      <div className="bg-muted/40 border-border/50 flex scrollbar-none items-center gap-2 overflow-x-auto rounded-lg border p-1.5">
        {filesReferences.map((file) => {
          const isSelected = activeTab === file.fileName;
          return (
            <button
              key={file.fileName}
              onClick={() => setActiveTab(file.fileName)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
                isSelected
                  ? "border-[#0A66FF] bg-[#0A66FF] text-white shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {file.fileName}
            </button>
          );
        })}
      </div>

      {/* Main Code Editor Frame Box */}
      {selectedFile && (
        <div className="border-border flex flex-col overflow-hidden rounded-xl border bg-[#1E1E1E] shadow-md">
          {/* Internal Code Window Content */}
          <div className="max-h-[380px] scrollbar-thin overflow-auto text-xs">
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1.25rem",
                borderRadius: 0,
                fontSize: "13px",
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
