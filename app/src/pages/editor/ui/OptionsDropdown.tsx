import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CloudDownload, Download, ImageDown, Menu, Upload } from "lucide-react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Input } from "@/components/ui/input";
import type { ChangeEvent } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import UploadObjectDialog from "./Upload/UploadObjectDialog";
import { ServerDownloadDialog } from "./ServerObjectDownload/ServerDownloadDialog";
import { useTranslation } from "react-i18next";

export function OptionsDropdown() {
  const { t } = useTranslation();
  const auth = useAuth();

  const signalDownload = () => {
    editorEventBus.emit(EDITOR_EVENT.SaveObject);
  };

  const signalRenderImage = () => {
    editorEventBus.emit(EDITOR_EVENT.RenderImage);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) return;
    if (event.target.files.length <= 0) return;

    const file = event.target.files[0];
    if (file === null) return;

    let fileExtension = file.name.split(".").pop();
    if (!fileExtension) return;
    fileExtension = fileExtension.toLowerCase();

    if (!["json"].includes(fileExtension)) {
      editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "WarningLogInvalidFileType");
      return;
    }

    sendFile(file);
  };

  const sendFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target === null) return;

      const fileData = e.target.result;

      if (typeof fileData === "string")
        editorEventBus.emit(EDITOR_EVENT.UploadObject, fileData);

    };

    reader.readAsText(file);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>

        <Button variant="outline" className="[&_svg]:size-6" >
          <Menu /> {t("Options")}
        </Button>

      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel> {t("Options")} </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signalDownload}>
          <Download /><p>{t("Download")}</p>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <label htmlFor="fileUpload" className="[&_svg]:size-6 w-full flex gap-2">
            <Upload /><p>{t("Import")}</p>
          </label>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={signalRenderImage}>
          <ImageDown /><p>{t("RenderImage")}</p>
        </DropdownMenuItem>

        {
          auth?.userName ?
            <DropdownMenuItem>
              <label htmlFor="uploadObjectDialog" className="[&_svg]:size-6 w-full flex gap-2">
                <Upload /><p>{t("UploadToServer")}</p>
              </label>
            </DropdownMenuItem>
            : null
        }

        <DropdownMenuItem>
          <label htmlFor="ServerDownloadObjectDialog" className="[&_svg]:size-6 w-full flex gap-2">
            <CloudDownload /><p>{t("AddFromServer")}</p>
          </label>
        </DropdownMenuItem>

      </DropdownMenuContent>

      <Input id="fileUpload" type="file" accept=".json" onChange={handleFileUpload} onClick={(e) => (e.currentTarget.value = "")} className="hidden" />

      {
        auth?.userName ?
          <>
            <UploadObjectDialog />
          </> : null
      }

      <ServerDownloadDialog showPublic={auth?.userName ? true : false} addAnimation={false} />

    </DropdownMenu>
  );

}

