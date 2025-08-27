import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AnimationSceneData, MitsuShortObjectData } from "@/lib/types/ServerResponseTypes";
import { useState } from "react";
import { PublicListDialog } from "./PublicListDialog";
import { UserListDialog } from "./UserListDialog";

type Props = {
  data: MitsuShortObjectData | AnimationSceneData,
  downloadUrl: string,
  cardDescriptionTexts: Array<string>,
  dialogDescriptionTexts: Array<string>,
  isUsers: boolean,
  patchUrl?: string,
  deleteUrl?: string,
}

export function ListCard({ data, isUsers, downloadUrl,
  cardDescriptionTexts, dialogDescriptionTexts, patchUrl, deleteUrl }: Props) {

  const [showDialog, setShowDialog] = useState(false);
  const imgUrl = "/api/v1/image" + data.imgPath;

  return (<>

    <Card className="w-fit border border-card-foreground/50 m-2 p-0 cursor-pointer 
     transition duration-200 hover:bg-card/10 hover:scale-105"
      onClick={() => {
        setShowDialog(true);
      }}>
      <CardHeader className="pt-4">
        <CardTitle>{data.name}</CardTitle>
        <CardDescription>
          {cardDescriptionTexts?.map((description, index) => (
            <p key={index}>{description}</p>
          ))}
        </CardDescription>
        <Separator orientation="horizontal" />
      </CardHeader>
      <CardContent className="w-100% p-0 m-0">
        <img src={imgUrl} width={256} height={256} className="rounded-b-2xl aspect-square" />
      </CardContent>
    </Card>

    {
      isUsers && patchUrl && deleteUrl ?
        <UserListDialog
          data={data}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          downloadUrl={downloadUrl}
          dialogDescriptionTexts={dialogDescriptionTexts}
          patchUrl={patchUrl}
          deleteUrl={deleteUrl}
        />
        :
        <PublicListDialog
          data={data}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          downloadUrl={downloadUrl}
          dialogDescriptionTexts={dialogDescriptionTexts}
        />
    }

  </>);

}
