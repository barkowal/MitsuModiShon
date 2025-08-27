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
} from "@/components/ui/sidebar";
import { Box, Clapperboard, Grid3x3, Home, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "./ui/separator";
import { AccountDropdown } from "@/pages/account/AccountDropdown";

const items = [
  {
    title: "HOME",
    url: "/",
    icon: Home,
  },
  {
    title: "EDITOR",
    url: "/Editor",
    icon: Box,
  },
  {
    title: "ANIMATION",
    url: "/Animation",
    icon: Clapperboard,
  },
  {
    title: "OBJECTS3D",
    url: "/Object3DListing",
    icon: PackageSearch,
  },
  {
    title: "SCENES",
    url: "/AnimationSceneListingPage",
    icon: Grid3x3,
  },
];



export function AppSidebar() {

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader />
      <SidebarContent>

        <SidebarGroup >
          <SidebarGroupLabel className="text-primary text-xl font-sans font-bold">
            <Link to={items[0].url}>
              MITSUMODISHON
            </Link>
          </SidebarGroupLabel>

          <Separator />

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup >

        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>

            <AccountDropdown />

          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>


    </Sidebar >
  );
}
