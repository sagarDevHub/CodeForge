"use client";

import { usePageTitle } from "@/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useBackgroundTasks } from "@/hooks/use-background-tasks";
import { Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

type ProjectStatus = {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  statusMessage: string;
  progress: number;
  createdAt: Date;
};

const CreatePage = () => {
  usePageTitle();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();
  const { addTask, updateTask, tasks } = useBackgroundTasks();

  const [currentProject, setCurrentProject] = useState<ProjectStatus | null>(
    null,
  );
  const [isPolling, setIsPolling] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);
  const progressToastIdRef = useRef<string | number | null>(null);

  // Check if there's already a task for this project
  useEffect(() => {
    const existingTask = tasks.find((t) => t.projectId === currentProject?.id);
    if (existingTask) {
      setCurrentProject({
        id: existingTask.projectId,
        name: existingTask.projectName,
        status: existingTask.status as any,
        statusMessage: existingTask.message,
        progress: existingTask.progress,
        createdAt: existingTask.createdAt,
      });
    }
  }, [tasks, currentProject?.id]);

  // Poll for project status
  useEffect(() => {
    if (
      !currentProject?.id ||
      currentProject.status === "completed" ||
      currentProject.status === "failed"
    ) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/project/status?projectId=${currentProject.id}`,
        );
        const data = await response.json();

        if (data) {
          setCurrentProject(data);
          updateTask(currentProject.id, {
            status: data.status,
            progress: data.progress,
            message: data.statusMessage || "Processing...",
          });

          // Update progress toast
          if (data.progress > 0 && data.progress < 100) {
            if (progressToastIdRef.current) {
              toast.loading(
                `⏳ ${data.statusMessage || "Processing..."} (${data.progress}%)`,
                {
                  id: progressToastIdRef.current,
                },
              );
            } else {
              progressToastIdRef.current = toast.loading(
                `⏳ ${data.statusMessage || "Processing..."} (${data.progress}%)`,
              );
            }
          }

          if (data.status === "completed") {
            // Dismiss all toasts
            if (toastIdRef.current) {
              toast.dismiss(toastIdRef.current);
              toastIdRef.current = null;
            }
            if (progressToastIdRef.current) {
              toast.dismiss(progressToastIdRef.current);
              progressToastIdRef.current = null;
            }

            toast.success(`✨ Project "${data.name}" is ready!`, {
              duration: 5000,
              icon: "🎉",
            });
            setIsPolling(false);
            clearInterval(interval);

            // ✅ Redirect to dashboard with the new project
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          } else if (data.status === "failed") {
            // Dismiss all toasts
            if (toastIdRef.current) {
              toast.dismiss(toastIdRef.current);
              toastIdRef.current = null;
            }
            if (progressToastIdRef.current) {
              toast.dismiss(progressToastIdRef.current);
              progressToastIdRef.current = null;
            }

            toast.error(`Failed to create project: ${data.statusMessage}`, {
              duration: 5000,
            });
            setIsPolling(false);
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Error fetching project status:", error);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      if (progressToastIdRef.current) {
        toast.dismiss(progressToastIdRef.current);
        progressToastIdRef.current = null;
      }
    };
  }, [currentProject?.id, currentProject?.status, updateTask, router]);

  function onSubmit(data: FormInput) {
    // Validate GitHub URL
    if (!data.repoUrl.includes("github.com")) {
      toast.error("Please enter a valid GitHub repository URL");
      return;
    }

    // Show loading toast
    toastIdRef.current = toast.loading(
      `Creating project "${data.projectName}"...`,
    );

    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: (project) => {
          if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
          }

          toast.info(
            `🚀 Project "${data.projectName}" is being created in the background`,
            {
              duration: 4000,
            },
          );

          addTask({
            id: project.id,
            projectId: project.id,
            projectName: data.projectName,
            status: "pending",
            progress: 0,
            message: "Initializing...",
          });

          setCurrentProject({
            id: project.id,
            name: data.projectName,
            status: "pending",
            statusMessage: "Initializing...",
            progress: 0,
            createdAt: new Date(),
          });

          refetch();
          reset();
        },
        onError: (error) => {
          if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
            toastIdRef.current = null;
          }
          toast.error(error.message || "Failed to create project");
        },
      },
    );
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      if (progressToastIdRef.current) {
        toast.dismiss(progressToastIdRef.current);
        progressToastIdRef.current = null;
      }
    };
  }, []);

  // Show progress UI if project is being created
  if (currentProject && currentProject.status !== "completed") {
    const isError = currentProject.status === "failed";

    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              {isError ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )}

              <h2 className="mt-4 text-xl font-semibold">
                {isError
                  ? "Project Creation Failed"
                  : "Creating your project..."}
              </h2>

              <p className="text-muted-foreground mt-2 text-sm">
                {currentProject.statusMessage || "Processing..."}
              </p>

              <div className="mt-4 w-full">
                <Progress
                  value={currentProject.progress}
                  className="h-2 w-full"
                />
                <p className="text-muted-foreground mt-2 text-xs">
                  {currentProject.progress}% complete
                </p>
              </div>

              {isError && (
                <Button
                  className="mt-4"
                  onClick={() => {
                    setCurrentProject(null);
                    setIsPolling(false);
                    if (toastIdRef.current) {
                      toast.dismiss(toastIdRef.current);
                      toastIdRef.current = null;
                    }
                    if (progressToastIdRef.current) {
                      toast.dismiss(progressToastIdRef.current);
                      progressToastIdRef.current = null;
                    }
                    toast.info("Ready to try again");
                  }}
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center gap-12 p-4">
      <Image
        src="/undraw_Github_create.svg"
        alt="Github logo"
        width={500}
        height={500}
        className="hidden h-56 w-auto lg:block"
      />
      <div className="w-full max-w-md">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-semibold">
            Link your Github Repository
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the URL of your repository to link it to CodeForge
          </p>
        </div>
        <div className="h-4"></div>
        <div className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register(`projectName`, { required: true })}
              placeholder="Project Name (e.g., my-awesome-app)"
              required
              disabled={createProject.isPending}
            />
            <div className="h-2"></div>
            <Input
              {...register(`repoUrl`, { required: true })}
              placeholder="GitHub URL (e.g., https://github.com/user/repo)"
              type="url"
              required
              disabled={createProject.isPending}
            />
            <div className="h-2"></div>
            <Input
              {...register(`githubToken`)}
              placeholder="GitHub Token (Optional - for private repos)"
              type="password"
              disabled={createProject.isPending}
            />
            <div className="h-4"></div>
            <Button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-[#0A66FF] font-medium text-white hover:bg-[#0A66FF]/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={createProject.isPending}
            >
              {createProject.isPending ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </div>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
