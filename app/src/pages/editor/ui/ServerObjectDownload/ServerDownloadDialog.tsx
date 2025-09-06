import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { SmallPublicMitsuListing } from "./SmallPublicMitsuListing";
import { SmallUserMitsuListing } from "./SmallUserMitsuListing";
import { useTranslation } from "react-i18next";

type Props = {
    showPublic: boolean;
    addAnimation: boolean;
}

export function ServerDownloadDialog({ showPublic, addAnimation }: Props) {
    const { t } = useTranslation();
    const [showExport, setShowExport] = useState(false);
    const [isPublicList, setIsPublicList] = useState(true);

    return (<>
        <Dialog open={showExport} onOpenChange={setShowExport}>

            <DialogTrigger asChild onClick={() => { setShowExport(true); }}>
                <Button id="ServerDownloadObjectDialog" className="hidden w-full" />
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {t("AddToScene")}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t("SelectAndAdd")}
                    </DialogDescription>

                    {
                        showPublic ?
                            <div className=" w-full flex font-bold justify-center items-center ">
                                <div
                                    onClick={() => { setIsPublicList(true); }}
                                    className={` ${isPublicList ? "bg-primary-foreground" : ""} text-center px-4 py-2 cursor-pointer hover:bg-primary/10 rounded transition duration-300`}
                                >
                                    <p className="w-[12ch] select-none ">
                                        {t("Public")}
                                    </p>
                                </div>
                                <div
                                    onClick={() => { setIsPublicList(false); }}
                                    className={` ${isPublicList ? "" : "bg-primary-foreground"} text-center px-4 py-2 cursor-pointer hover:bg-primary/10 rounded transition duration-300`}
                                >
                                    <p className=" w-[12ch] select-none " >
                                        {t("MyObjects")}
                                    </p>
                                </div>
                            </div>
                            : null
                    }

                    {
                        isPublicList ?
                            <SmallPublicMitsuListing addAnimation={addAnimation} />
                            :
                            <SmallUserMitsuListing addAnimation={addAnimation} />
                    }

                </DialogHeader>
            </DialogContent>

        </Dialog >
    </>);
}
