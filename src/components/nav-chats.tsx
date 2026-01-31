"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface Conversation {
  id: string
  createdAt: number
  title?: string
}

export function NavChats({
  conversations,
  activeConversationId,
  onSelectConversation,
}: {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Your Chats</SidebarGroupLabel>
      <SidebarMenu>
        {conversations.map((conversation) => (
          <SidebarMenuItem key={conversation.id}>
            <SidebarMenuButton
              tooltip={conversation.title || "Untitled Conversation"}
              isActive={activeConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <span>{conversation.title || "Untitled Conversation"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
