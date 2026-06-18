"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";

import {
  Bot,
  CreditCard,
  LayoutDashboard,
  Plus,
  ChevronRight,
  Workflow,
  Rocket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: `Dashboard`,
    url: `/dashboard`,
    icon: LayoutDashboard,
  },
  {
    title: `Q&A`,
    url: `/qa`,
    icon: Bot,
  },
  {
    title: `Repo Architecture`,
    url: `/architecture`,
    icon: Workflow,
  },
  {
    title: `Deployment Check`,
    url: "/deployment",
    icon: Rocket,
  },
  {
    title: `Billing`,
    url: `/billing`,
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader className={cn("pb-3", open && "border-b")}>
          <div
            className={cn(
              "flex items-center gap-2 px-1",
              open ? "justify-between" : "flex-col justify-center",
            )}
          >
            <div className="flex items-center gap-2">
              <Image
                src={`/logo.png`}
                alt="logo"
                width={32}
                height={32}
                className="shrink-0"
              />
              {open && (
                <h1 className="text-primary/80 animate-in fade-in text-lg font-bold tracking-tight duration-200">
                  CodeForge
                </h1>
              )}
            </div>

            {open ? (
              <SidebarTrigger className="text-muted-foreground hover:bg-muted h-8 w-8" />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="text-muted-foreground hover:bg-muted animate-in zoom-in-75 mt-2 h-8 w-8 rounded-md duration-250"
                title="Expand Sidebar"
              >
                <ChevronRight className="size-4 stroke-[2.5]" />
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="flex flex-col gap-0 overflow-hidden">
          <SidebarGroup className="flex-none">
            {open && <SidebarGroupLabel>Application</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={!open ? item.title : undefined}
                      className={cn(
                        "rounded-lg transition-colors",
                        pathname === item.url && "bg-[#0A66FF]! text-white!",
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {open && <hr className="border-border/60 mx-3" />}

          <SidebarGroup className="flex min-h-0 flex-1 flex-col overflow-hidden pb-2">
            {open && <SidebarGroupLabel>Your Projects</SidebarGroupLabel>}

            <div
              className={cn(
                "flex-1 space-y-1 overflow-y-auto",
                open ? "scrollbar-thin pr-1" : "scrollbar-none",
              )}
            >
              <SidebarMenu>
                {projects?.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={!open ? project.name : undefined}
                      className="hover:bg-muted/60 cursor-pointer justify-center rounded-lg"
                    >
                      <div
                        className={cn(
                          "flex w-full items-center",
                          open ? "justify-start gap-3" : "justify-center",
                        )}
                        onClick={() => setProjectId(project.id)}
                      >
                        <div
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold shadow-sm transition-all",
                            project.id === projectId
                              ? "border-[#0A66FF] bg-[#0A66FF] text-white"
                              : "bg-background text-muted-foreground",
                          )}
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </div>

                        {open && (
                          <span
                            className={cn(
                              "animate-in fade-in truncate text-sm duration-200",
                              project.id === projectId
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground",
                            )}
                          >
                            {project.name}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarGroup>
        </SidebarContent>

        {open && (
          <SidebarFooter className="bg-background/50 animate-in fade-in border-t p-3 backdrop-blur-sm duration-200">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/create" className="block w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border/80 w-full justify-start gap-2 rounded-lg border-dashed text-xs font-medium shadow-sm hover:border-solid"
                  >
                    <Plus className="text-muted-foreground size-3.5" />
                    Create Project
                  </Button>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        )}
      </Sidebar>
    </TooltipProvider>
  );
}
