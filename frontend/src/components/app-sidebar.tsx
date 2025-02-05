import { ChartNoAxesGantt, HeartHandshake, LayoutDashboard, Users } from "lucide-react"
import logo from '../assets/Logo-black.png'

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
    {
        title: "Dashboard",
        url: "user/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Assets",
        url: "user/assetsList",
        icon: Users,
    },
    {
        title: "Requests",
        url: "user/requests",
        icon: HeartHandshake,
    },
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>

                    {/* Logo */}
                    <SidebarGroupLabel className="pt-8 pb-16">
                        <img src={logo} alt="" />
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu className=" gap-y-2">

                            {items.map((item) => (
                                <SidebarMenuItem className="" key={item.title}>
                                    <SidebarMenuButton className="bg-[#688D48] text-white py-5 text-[14px]" asChild>
                                        <a href={item.url}>
                                            <item.icon size={24} />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
