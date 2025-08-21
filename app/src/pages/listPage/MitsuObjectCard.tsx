import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MitsuShortObjectData } from "@/lib/types/ServerResponseTypes";
import { useState } from "react";

type Props = {
  mitsuObjectData: MitsuShortObjectData;
}

export function MitsuObjectCard({ mitsuObjectData }: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const imgUrl = "/api/v1/image" + mitsuObjectData.imgPath;

  return (<>

    <Card className="w-fit border border-card-foreground/50 m-2 p-0 cursor-pointer 
     transition duration-200 hover:bg-card/10 hover:scale-105"
      onClick={() => {
        setShowDialog(true);
      }}>
      <CardHeader className="pt-4">
        <CardTitle>{mitsuObjectData.name}</CardTitle>
        <CardDescription>
          <p>
            Username: {mitsuObjectData.username}
          </p>
          <p>
            MitusModiShon Object
          </p>
        </CardDescription>
        <Separator orientation="horizontal" />
      </CardHeader>
      <CardContent className="w-100% p-0 m-0">
        <img src={imgUrl} width={256} height={256} className="rounded-b-2xl" />
      </CardContent>
    </Card>
    {/* <EyeShapeDialog eyeShape={eyeShape} showDialog={showDialog} setShowDialog={setShowDialog} /> */}

  </>);

}
