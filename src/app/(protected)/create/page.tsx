"use client";

import { usePageTitle } from "@/hooks/use-page-title";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  usePageTitle();
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success(`Project created successfully`);
          refetch();
          reset();
        },
        onError: () => {
          toast.error(`Failed to create project`);
        },
      },
    );
    return true;
  }
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image
        src="/undraw_Github_create.svg"
        alt="Github logo"
        width={500}
        height={500}
        className="h-56 w-auto"
      />
      <div className="">
        <div className="">
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
              placeholder="Project Name"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register(`repoUrl`, { required: true })}
              placeholder="Github URL"
              type="url"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register(`githubToken`)}
              placeholder="Github Token (Optional)"
            />
            <div className="h-4"></div>
            <Button
              type="submit"
              className="cursor-pointer rounded-lg bg-[#0A66FF] font-medium text-white hover:bg-[#0A66FF]/90 disabled:cursor-not-allowed disabled:opacity-50"
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
