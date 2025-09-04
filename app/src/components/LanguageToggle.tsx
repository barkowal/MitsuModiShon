import { Languages } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLang = (val: string) => {
    i18n.changeLanguage(val);
  };

  return (<>
    <span className="flex mx-2 items-center justify-between">
      <p><Languages /></p>
      <ToggleGroup defaultValue={i18n.resolvedLanguage} type="single" onValueChange={changeLang}>
        <ToggleGroupItem value="pl" aria-label="Toggle polish.">
          PL
        </ToggleGroupItem>
        <ToggleGroupItem value="en" aria-label="Toggle english.">
          EN
        </ToggleGroupItem>
      </ToggleGroup>
    </span>
  </>);

}
