"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BackgroundTask {
  id: string;
  projectId: string;
  projectName: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  createdAt: Date;
}

interface BackgroundTasksStore {
  tasks: BackgroundTask[];
  addTask: (task: Omit<BackgroundTask, "createdAt">) => void;
  updateTask: (id: string, updates: Partial<BackgroundTask>) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
}

export const useBackgroundTasks = create<BackgroundTasksStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, createdAt: new Date() }],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task,
          ),
        })),
      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      clearCompleted: () =>
        set((state) => ({
          tasks: state.tasks.filter(
            (task) => task.status !== "completed" && task.status !== "failed",
          ),
        })),
    }),
    {
      name: "background-tasks-storage",
    },
  ),
);
