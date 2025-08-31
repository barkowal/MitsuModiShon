import ColorPopover from "@/components/ColorPopover";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sun } from "lucide-react";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { convertHexColorStringToNumber } from "../utils/utils";

export function AddLightDialog() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentType, setCurrentType] = useState(0);
    const [currentColor, setCurrentColor] = useState("#ffffff");
    const [currentIntensity, setCurrentIntensity] = useState(1);
    const lights = ["AmbientLight", "PointLight"];

    const resetCurrentParams = () => {
        setCurrentColor("#ffffff");
        setCurrentIntensity(1);
    };

    const handleOpenChange = () => {
        setCurrentType(0);
        resetCurrentParams();
        setIsDialogOpen(!isDialogOpen);
    };

    const handleAddLight = () => {
        const lightParams = [currentType, convertHexColorStringToNumber(currentColor), currentIntensity];
        editorEventBus.emit(EDITOR_EVENT.AddLight, lightParams);
    };

    return (

        <Dialog onOpenChange={handleOpenChange} open={isDialogOpen}>
            <DialogTrigger asChild onClick={() => { setIsDialogOpen(true); }}>

                <Button className="[&_svg]:size-6" >
                    <Sun className="size-1" />
                </Button>

            </DialogTrigger>
            <DialogContent>
                <DialogHeader >
                    <DialogTitle className="text-center">Add Light</DialogTitle>
                    <DialogDescription className="text-center">
                        Select light with preferred settings and add it to the scene.
                    </DialogDescription>
                </DialogHeader>

                <Select
                    defaultValue={"0"}
                    onValueChange={(val: string) => { setCurrentType(Number(val)); resetCurrentParams(); }}>
                    <SelectTrigger className="w-full min-[20ch]: m-auto">
                        <SelectValue placeholder="Light" />
                    </SelectTrigger>
                    <SelectContent >
                        {
                            lights.map((obj, index) => (
                                <SelectItem value={index.toString()} key={index}>{obj}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>

                <span className="grid grid-cols-2 gap-1 font-bold m-2">

                    <span>COLOR</span>
                    <ColorPopover colorValue={currentColor} onColorChange={(val: string) => { setCurrentColor(val); }} />

                    <span>INTENSITY</span>
                    <span className="flex gap-2">
                        {currentIntensity}
                        <Slider
                            value={[currentIntensity]}
                            defaultValue={[1]}
                            onValueChange={(val: Array<number>) => { setCurrentIntensity(val[0]); }}
                            min={0}
                            max={10}
                            step={0.1}
                        />
                    </span>


                </span>


                <DialogFooter>
                    <div className="w-full text-center" onClick={handleAddLight}>
                        <Button>ADD</Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>

    );

}
