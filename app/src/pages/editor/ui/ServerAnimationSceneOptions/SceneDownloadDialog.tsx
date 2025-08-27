import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { SmallPublicSceneListing } from "./SmallPublicSceneListing";
import { SmallUserSceneListing } from "./SmallUserSceneListing";

type Props = {
    showPublic: boolean;
}

export function SceneDownloadDialog({ showPublic }: Props) {
    const [showExport, setShowExport] = useState(false);
    const [isPublicList, setIsPublicList] = useState(true);

    return (<>
        <Dialog open={showExport} onOpenChange={setShowExport}>

            <DialogTrigger asChild onClick={() => { setShowExport(true); }}>
                <Button id="ServerDownloadSceneDialog" className="hidden w-full" />
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Load Scene
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Select scene to load.
                    </DialogDescription>

                    {
                        showPublic ?
                            <div className=" w-full flex font-bold justify-center items-center ">
                                <div
                                    onClick={() => { setIsPublicList(true); }}
                                    className={` ${isPublicList ? "bg-primary-foreground" : ""} text-center px-4 py-2 cursor-pointer hover:bg-primary/10 rounded transition duration-300`}
                                >
                                    <p className="w-[12ch] select-none ">
                                        Public
                                    </p>
                                </div>
                                <div
                                    onClick={() => { setIsPublicList(false); }}
                                    className={` ${isPublicList ? "" : "bg-primary-foreground"} text-center px-4 py-2 cursor-pointer hover:bg-primary/10 rounded transition duration-300`}
                                >
                                    <p className=" w-[12ch] select-none " >
                                        My Scenes
                                    </p>
                                </div>
                            </div>
                            : null
                    }

                    {
                        isPublicList ?
                            <SmallPublicSceneListing /> :
                            <SmallUserSceneListing />
                    }

                </DialogHeader>
            </DialogContent>

        </Dialog >
    </>);
}
