"use client"

import { LayoutGrid } from "lucide-react"

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
          <a href="#">
            <LayoutGrid className="size-3" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Agent Hub Demo</span>
            </div>
          </a>
        </SidebarMenuButton>
        <SidebarTrigger className="absolute right-2 size-6 group-data-[collapsible=icon]:static group-data-[collapsible=icon]:mx-auto [&>svg]:size-8" />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
