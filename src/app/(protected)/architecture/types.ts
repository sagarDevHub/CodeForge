export interface GraphNode {
  id: string;
  label: string;
  type: "folder" | "file" | "service" | "database" | "api" | "auth";
  metadata?: {
    imports?: string[];
    exports?: string[];
    description?: string;
    complexity?: number;
    lineCount?: number;
  };
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  type?: "import" | "export" | "dependency" | "call" | "inherit";
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics?: {
    totalModules: number;
    totalFiles: number;
    complexity: number;
    dependencies: number;
  };
}

export type FilterType = "all" | "module" | "file" | "resource";
export type ViewMode = "graph" | "list";

export interface Blueprint {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  metadata: any;
}
