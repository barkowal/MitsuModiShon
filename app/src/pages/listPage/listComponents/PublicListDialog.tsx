import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { DownloadJSON } from "@/lib/DownloadJSON";
import type { AnimationSceneData, MitsuShortObjectData } from "@/lib/types/ServerResponseTypes";
import { useEffect } from "react";

type Props = {
  data: MitsuShortObjectData | AnimationSceneData,
  showDialog: boolean,
  setShowDialog: CallableFunction,
  downloadUrl: string,
  dialogDescriptionTexts: Array<string>,
}

export function PublicListDialog({ data, showDialog, setShowDialog, downloadUrl, dialogDescriptionTexts }: Props) {
  const { response, error, makeRequest } = useAuthFetch(downloadUrl);
  const imgUrl = "/api/v1/image" + data.imgPath;

  const downloadObject = () => {
    makeRequest(`/${data.id}`, "GET");
  };

  useEffect(() => {
    if (response) {
      DownloadJSON(response);
    }
  }, [response]);

  return (<>

    <Dialog open={showDialog} onOpenChange={() => { setShowDialog(false); }}>
      <DialogContent className="sm:max-w-[425px]">

        <DialogHeader>
          <DialogTitle className="text-2xl">{data.name}</DialogTitle>

          <DialogDescription className="w-100% p-0 m-auto ">
            <img src={imgUrl} className="rounded-2xl border-primary border" />
          </DialogDescription>

          <div className="my-2">

            {dialogDescriptionTexts?.map((description, index) => (
              <DialogDescription key={index} className="w-100% p-0 m-auto ">
                {description}
              </DialogDescription>
            ))}

          </div>

        </DialogHeader>
        <DialogFooter>
          <div className=" grid grid-cols-2 justify-center w-full items-center gap-2 gap-y-6 p-2 ">

            <a download href={imgUrl} className=" h-9 px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground cursor-pointer font-bold rounded-md inline-flex items-center justify-center whitespace-nowrap text-sm "> DOWNLOAD IMAGE </a>

            <a onClick={downloadObject} className=" h-9 px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground cursor-pointer  font-bold rounded-md inline-flex items-center justify-center whitespace-nowrap text-sm "> DOWNLOAD DATA </a>

          </div>
        </DialogFooter>
        {error ?
          <div className="w-[100%] text-center text-fail-primary">{error}</div> : null
        }
      </DialogContent >
    </Dialog >


  </>);

}

