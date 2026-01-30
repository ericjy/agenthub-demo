"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavHeader } from "./nav-header"
import { NavChats } from "./nav-chats"

interface Conversation {
  id: string
  createdAt: number
  title?: string
}

interface AppSidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onNewChat: () => void
  onSelectConversation: (id: string) => void
}

export function AppSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavHeader />
        <NavMain onNewChat={onNewChat} />
      </SidebarHeader>
      <SidebarContent>
        <NavChats
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
        />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
