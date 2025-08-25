import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CloudDownload, Download, ImageDown, Menu, Upload } from "lucide-react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Input } from "@/components/ui/input";
import type { ChangeEvent } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import UploadObjectDialog from "./Upload/UploadObjectDialog";
import { ServerDownloadDialog } from "./ServerDownload/ServerDownloadDialog";

export function OptionsDropdown() {
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
      editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "Invalid file type. Please upload a JSON file.");
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

        <Button className="[&_svg]:size-6" >
          <Menu /> Options
        </Button>

      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel> Options </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signalDownload}>
          <Download /><p>Download</p>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <label htmlFor="fileUpload" className="[&_svg]:size-6 w-full flex gap-2">
            <Upload /><p>Upload</p>
          </label>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={signalRenderImage}>
          <ImageDown /><p>Render Image</p>
        </DropdownMenuItem>

        {
          auth?.userName ?
            <DropdownMenuItem>
              <label htmlFor="uploadObjectDialog" className="[&_svg]:size-6 w-full flex gap-2">
                <Upload /><p>Upload to server</p>
              </label>
            </DropdownMenuItem>
            : null
        }

        <DropdownMenuItem>
          <label htmlFor="ServerDownloadObjectDialog" className="[&_svg]:size-6 w-full flex gap-2">
            <CloudDownload /><p>Add From Server</p>
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

      <ServerDownloadDialog showPublic={auth?.userName ? true : false} />

    </DropdownMenu>
  );

}

