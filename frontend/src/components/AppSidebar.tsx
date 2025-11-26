import { LayoutDashboard, Video, Users, BarChart3, Settings, LogOut, Zap, Code, PanelLeftClose, PanelLeft, VideoIcon } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const userItems = [
  { title: "Dashboard", url: "/userdashboard", icon: LayoutDashboard },
  { title: "My Meetings", url: "/meetings", icon: Video },
  { title: "Summarize Meetings", url: "/summarize", icon: Zap },
];

const adminItems = [
  { title: "Admin Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "All Meetings", url: "/admin/meetings", icon: Video },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

const developmentItems = [
  { title: "API Integration", url: "/admin/api-integration", icon: Code },
];

export function AppSidebar() {
  const { open, toggleSidebar } = useSidebar();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const items = isAdmin ? adminItems : userItems;

  return (
    <Sidebar className="border-r border-border transition-all duration-300 ease-in-out">
      <SidebarContent className="transition-all duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <VideoIcon className="h-6 w-6 flex-shrink-0" />
              {open && (
                <div className="flex-1">
                  <h1 className="text-2xl font-bold font-playfair">MeetingMind</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAdmin ? "Admin Panel" : "AI Meeting Summaries"}
                  </p>
                </div>
              )}
            </NavLink>
            {open && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 flex-shrink-0 ml-auto"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </div>
          {!open && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 mt-2 mx-auto"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Separator />

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-2 text-xs">
            {open ? (isAdmin ? "Admin Menu" : "Navigation") : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted transition-colors"
                      activeClassName="bg-muted font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-6 py-2 text-xs">
              {open ? "Development Menu" : ""}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {developmentItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-muted transition-colors"
                        activeClassName="bg-muted font-medium"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-muted"
          onClick={() => (window.location.href = "/")}
        >
          <LogOut className="h-4 w-4" />
          {open && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
