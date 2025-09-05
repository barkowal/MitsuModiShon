import { useEffect, useState, type KeyboardEvent } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export function ObjectNameMenu() {
  const { t } = useTranslation();
  const [name, setName] = useState("Name");

  const changeName = () => {
    editorEventBus.emit(EDITOR_EVENT.ChangeObjectName, name);
  };

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key == "Enter") {
      changeName();
    }
  };

  useEffect(() => {
    const handleRefreshName = (name: string) => {
      setName(name);
    };

    editorEventBus.on(EDITOR_EVENT.RefreshNameMenu, handleRefreshName);

    return () => {
      editorEventBus.off(EDITOR_EVENT.RefreshNameMenu, handleRefreshName);
    };

  }, []);

  return (<>
    <div className="bg-sidebar-accent p-1 font-bold select-none">
      <span className="flex gap-2 items-center justify-between">
        <span className="mx-2">
          {t("Name")}
        </span>
        <span className="mx-2 flex-3/5">
          <Input className="w-full min-w-[20ch] rounded-none" value={t(name)} placeholder={t("Name")}
            onChange={(event) => { setName(event ? event.target.value : ""); }}
            onKeyDown={(e: KeyboardEvent) => { handleKey(e); }} />
        </span>
        <span className="mx-2">
          <Button onClick={() => { changeName(); }}>{t("Change")}</Button>
        </span>
      </span>
    </div>
  </>);

}
