"use client"

import { SquarePen } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({ onNewChat }: { onNewChat: () => void }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="New Chat" onClick={onNewChat}>
          <SquarePen />
          <span>New Chat</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
