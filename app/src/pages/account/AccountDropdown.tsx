import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth/useAuth";
import { ChevronUp, CircleUserRound, User2 } from "lucide-react";
import { Link } from "react-router-dom";

export function AccountDropdown() {
  const auth = useAuth();

  return (<>
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-full cursor-pointer">
        <SidebarMenuButton>
          <User2 /> {auth?.userName ? auth?.userName : "ACCOUNT"}
          <ChevronUp className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        className="bg-card border border-sidebar-accent-foreground select-none 
                dropdown-content-width-full rounded-xs text-center"
      >
        <DropdownMenuLabel className="p-1 ">
          <span>
            <CircleUserRound className="inline-block" />
          </span>
          <span >
            <b> MY ACCOUNT</b>
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {auth?.userName ?
          <Link to={"/"}>
            <DropdownMenuItem className="p-1 outline-none hover:bg-sidebar-accent cursor-pointer"
              onClick={() => { auth.logOut(); }}>
              <span>Logout</span>
            </DropdownMenuItem>
          </Link> :
          <div>
            <Link to={"/Login"}>
              <DropdownMenuItem className="p-1 outline-none hover:bg-sidebar-accent cursor-pointer">
                <span>Sign In</span>
              </DropdownMenuItem>
            </Link>

            <Link to={"/Register"}>
              <DropdownMenuItem className="p-1 outline-none hover:bg-sidebar-accent cursor-pointer">
                <span>Sign Up</span>
              </DropdownMenuItem>
            </Link>
          </div>
        }

      </DropdownMenuContent>
    </DropdownMenu>
  </>);
}
