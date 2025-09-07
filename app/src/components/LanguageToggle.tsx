import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLang = (val: string) => {
    i18n.changeLanguage(val);
  };

  return (<>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages />
          <span className="sr-only">{i18n.t("ToggleLanguage")}</span>

        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" >

        <DropdownMenuItem className={i18n.resolvedLanguage === "pl" ? "bg-primary/10" : ""} onClick={() => changeLang("pl")}>
          {i18n.t("PolishLanguage")}
        </DropdownMenuItem>

        <DropdownMenuItem className={i18n.resolvedLanguage === "en" ? "bg-primary/10" : ""} onClick={() => changeLang("en")}>
          {i18n.t("EnglishLanguage")}
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu >
  </>);

}
