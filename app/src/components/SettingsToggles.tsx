import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

export function SettingsToggles() {

  return (
    < span className="flex m-2 items-center justify-evenly" >

      <ThemeToggle />

      <LanguageToggle />

    </span >
  );

}
