import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
    onConfirm: CallableFunction;
};

export function SceneLoadDialog({ onConfirm }: Props) {
    const { t } = useTranslation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenChange = () => {
        setIsDialogOpen(!isDialogOpen);
    };

    const handleConfirm = () => {
        onConfirm();
        setIsDialogOpen(false);
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
    };

    return (<>
        <Dialog onOpenChange={handleOpenChange} open={isDialogOpen}>
            <DialogTrigger asChild onClick={() => { setIsDialogOpen(true); }}>
                <Button id="sceneLoadDialog" className="hidden w-full" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader >
                    <DialogTitle className="text-center">{t("AreYouSure")}</DialogTitle>
                    <DialogDescription className="text-center">
                        {t("AllUnsavedProgressLost")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-evenly">
                    <div className="w-full text-center" >
                        <Button className="bg-destructive" onClick={handleConfirm}>{t("Yes").toUpperCase()}</Button>
                    </div>
                    <div className="w-full text-center"  >
                        <Button onClick={handleCancel}>{t("Cancel").toUpperCase()}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>);

}
