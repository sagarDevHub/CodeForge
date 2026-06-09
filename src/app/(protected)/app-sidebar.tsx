"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";

import {
  Bot,
  CreditCard,
  LayoutDashboard,
  Plus,
  Presentation,
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
    title: `Meetings`,
    url: `/meetings`,
    icon: Presentation,
  },
  {
    title: `Billing`,
    url: `/billing`,
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, projectId, setProjectId } = useProject();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src={`/logo.png`} alt="logo" width={40} height={40} />
          {open && (
            <h1 className="text-primary/80 text-xl font-bold">CodeForge</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/*  Application */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "rounded-lg",
                      pathname === item.url && "bg-[#0A66FF]! text-white!",
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    <div
                      className="flex items-center gap-3"
                      onClick={() => {
                        setProjectId(project.id);
                      }}
                    >
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-md border text-sm",
                          {
                            "bg-[#0A66FF] text-white": project.id === projectId,
                          },
                        )}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>

                      <span className="truncate">{project.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>

              {open && (
                <SidebarMenuItem className="mt-2">
                  <Link href="/create" className="block">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start gap-2 rounded-lg"
                    >
                      <Plus className="size-4" />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
