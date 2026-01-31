"use client"

import { Sparkles } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function NavHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="relative flex h-12 items-center">
        <SidebarMenuButton
          size="lg"
          asChild
          className="group-data-[collapsible=icon]:hidden"
        >
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-foreground">
              <Sparkles className="size-4 text-background" />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="text-sm font-semibold">AgentHub</span>
              <span className="text-[10px] text-muted-foreground">Demo</span>
            </div>
          </a>
        </SidebarMenuButton>
        <SidebarTrigger className="absolute right-2 size-6 group-data-[collapsible=icon]:static group-data-[collapsible=icon]:mx-auto [&>svg]:size-8" />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
