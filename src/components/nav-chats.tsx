"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavChats({
  chats,
}: {
  chats: {
    title: string
    url: string
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Your Chats</SidebarGroupLabel>
      <SidebarMenu>
        {chats.map((chat) => (
          <SidebarMenuItem key={chat.title}>
            <SidebarMenuButton tooltip={chat.title}>
              <span>{chat.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
