import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/AppSidebar";
import "./App.css";
import AuthProvider from "./hooks/auth/AuthProvider";

function App() {

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <SidebarProvider>
            <AppSidebar />
            <div className="app w-full h-[100vh]">
              <SidebarTrigger className="absolute" />
              <div className="children w-full h-full">
                <Outlet />
              </div>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
