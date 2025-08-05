import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clapperboard } from "lucide-react";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { BoxLoadingAnimation } from "@/components/BoxLoadingAnimation";
import { LoadingText } from "@/components/LoadingText";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RenderAnimationDialog() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [cancelInfo, setCancelInfo] = useState("");
    const [renderResolution, setRenderResolution] = useState({ width: 720, height: 480 });

    const handleOpenChange = () => {
        if (isDialogOpen && isRendering) {
            setCancelInfo("Please stop rendering before leaving.");
            return;
        }
        setIsDialogOpen(!isDialogOpen);
        setCancelInfo("");
    };

    const changeRenderResolution = (option: number) => {

        switch (option) {
            case 0: setRenderResolution({ width: 640, height: 360 }); break;
            case 1: setRenderResolution({ width: 720, height: 480 }); break;
            case 2: setRenderResolution({ width: 1280, height: 720 }); break;
            case 3: setRenderResolution({ width: 1920, height: 1080 }); break;
            default: setRenderResolution({ width: 720, height: 480 }); break;
        };

    };

    const handleRenderAnimation = () => {
        editorEventBus.emit(EDITOR_EVENT.RenderAnimation, [renderResolution.width, renderResolution.height]);
    };

    useEffect(() => {

        const handleRenderingSignal = (isRendering: boolean) => {

            setIsRendering(isRendering);

            if (!isRendering) {
                setCancelInfo("");
            }
        };

        editorEventBus.on(EDITOR_EVENT.IsRenderingSignal, handleRenderingSignal);
        return (() => {
            editorEventBus.off(EDITOR_EVENT.IsRenderingSignal, handleRenderingSignal);
        });

    }, []);

    return (
        <Dialog onOpenChange={handleOpenChange} open={isDialogOpen}>
            <DialogTrigger asChild onClick={() => { setIsDialogOpen(true); }}>
                <Button id="renderDialog" className="hidden w-full" />
            </DialogTrigger>

            <DialogContent>
                <DialogHeader >
                    <DialogTitle className="text-center">Render Animation</DialogTitle>
                    <DialogDescription className="text-center">
                        Select render settings and click the button to render animation.
                    </DialogDescription>
                </DialogHeader>

                {isRendering ?
                    <div className="grid gap-3 justify-center items-center w-full">
                        <div className="w-full flex justify-center">
                            <BoxLoadingAnimation />
                        </div>
                        <div className="w-full flex justify-center">
                            <LoadingText LoadingText="Rendering" />
                        </div>
                        <div className="w-full flex justify-center">
                            <Button className="w-fit" onClick={() => { editorEventBus.emit(EDITOR_EVENT.CancelRenderingAnimation); }}>Cancel</Button>
                        </div>
                        <p className="text-warning-log">{cancelInfo}</p>
                    </div>
                    :
                    <div className="w-full items-center justify-center grid grid-cols-1 gap-2">

                        <div className="w-full items-center justify-evenly flex">
                            <p>Resolution:</p>
                            <Select
                                defaultValue="0"
                                onValueChange={(val: string) => { changeRenderResolution(Number(val)); }}>
                                <SelectTrigger className="min-w-[20ch]">
                                    <SelectValue placeholder="Resolution" />
                                </SelectTrigger>
                                <SelectContent >
                                    <SelectItem value="0" >640x360</SelectItem>
                                    <SelectItem value="1" >720x480</SelectItem>
                                    <SelectItem value="2" >1280x720</SelectItem>
                                    <SelectItem value="3" >1920x1080</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full items-center justify-evenly my-2 flex ">
                            <Button className="[&_svg]:size-6 w-fit" onClick={handleRenderAnimation}>
                                <Clapperboard className="size-1" />
                                <p>Render</p>
                            </Button>
                        </div>
                    </div>
                }

            </DialogContent>
        </Dialog >
    );
}
