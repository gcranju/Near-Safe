import { Home, Send, List, Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "New Proposal", url: "/new-transaction", icon: Send },
  { title: "Proposals", url: "/transactions", icon: List },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            {open && (
              <div>
                <h2 className="font-semibold text-sm text-sidebar-accent-foreground tracking-tight">
                  Near Safe
                </h2>
                <p className="text-[11px] text-sidebar-foreground/60">Multisig</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="mt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {open && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/40">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              NEAR Mainnet
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
