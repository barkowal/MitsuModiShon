import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t("ToggleTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">

        <DropdownMenuItem className={theme === "light" ? "bg-primary/10" : ""} onClick={() => setTheme("light")}>
          {t("Light")}
        </DropdownMenuItem>

        <DropdownMenuItem className={theme === "dark" ? "bg-primary/10" : ""} onClick={() => setTheme("dark")}>
          {t("Dark")}
        </DropdownMenuItem>

        <DropdownMenuItem className={theme === "system" ? "bg-primary/10" : ""} onClick={() => setTheme("system")}>
          {t("System")}
        </DropdownMenuItem>

        <DropdownMenuItem className={theme === "mitsu_dark" ? "bg-primary/10" : ""} onClick={() => setTheme("mitsu_dark")}>
          {t("NightViolet")}
        </DropdownMenuItem>

        <DropdownMenuItem className={theme === "mitsu_light" ? "bg-primary/10" : ""} onClick={() => setTheme("mitsu_light")}>
          {t("DayBlue")}
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
