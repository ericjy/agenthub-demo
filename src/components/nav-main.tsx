"use client"

import { Plus, Search } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "New Chat",
    url: "#",
    icon: Plus,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
]

export function NavMain() {
  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
