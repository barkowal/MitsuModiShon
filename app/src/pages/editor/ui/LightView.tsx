import ColorPopover from "@/components/ColorPopover";
import DraggableInput from "@/components/DraggableInput";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { convertHexColorNumberToString, convertHexColorStringToNumber } from "../utils/utils";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { LIGHT_ARRAY_DATA } from "../utils/Types";

export function LightView() {
    const [isNewData, setIsNewData] = useState(false);
    const [lightID, setLightID] = useState(0);
    const [currentColor, setCurrentColor] = useState(0);
    const [currentIntensity, setCurrentIntensity] = useState(0);

    const changeLightColor = (val: string) => {
        const col = convertHexColorStringToNumber(val);
        setCurrentColor(col);
        setIsNewData(true);
    };

    const changeLightIntensity = (val: number) => {
        setCurrentIntensity(val);
        setIsNewData(true);
    };


    useEffect(() => {
        // TODO change it to listen something else not document
        const sendLightData = () => {
            if (!isNewData) return;

            const data = [lightID, currentColor, currentIntensity];
            editorEventBus.emit(EDITOR_EVENT.ChangeLightData, data);
            setIsNewData(false);
        };

        const handleRefreshLightMenu = (lighData: Array<number>) => {
            setLightID(lighData[LIGHT_ARRAY_DATA.id]);
            setCurrentColor(lighData[LIGHT_ARRAY_DATA.color]);
            setCurrentIntensity(lighData[LIGHT_ARRAY_DATA.intensity]);
        };

        document.addEventListener("mouseup", sendLightData);
        editorEventBus.on(EDITOR_EVENT.RefreshLightMenu, handleRefreshLightMenu);

        return (() => {
            document.removeEventListener("mouseup", sendLightData);
            editorEventBus.off(EDITOR_EVENT.RefreshLightMenu, handleRefreshLightMenu);
        });



    }, [lightID, currentColor, currentIntensity, isNewData]);

    return (

        <div className="bg-sidebar-accent my-2 overflow-auto ">
            <div className="w-[calc(100%-10px)] h-[calc(100%-10px)]">
                <div className=" select-none p-2 flex justify-between" >
                    <span className="w-full font-bold">
                        LIGHT
                    </span>
                </div>
                <Separator orientation="horizontal" />

                <div className="bg-sidebar-accent p-1 font-bold select-none">
                    <span className=" flex items-center justify-between ">
                        <span className="mx-2">
                            Light Color
                        </span>
                        <ColorPopover
                            onColorChange={(val: string) => { changeLightColor(val); }}
                            colorValue={convertHexColorNumberToString(currentColor)} />
                    </span>
                    <span className=" mx-2 flex items-center justify-between ">
                        INTENSITY
                        <DraggableInput labelText="VALUE: " minValue={0} maxValue={100} decimalPoints={2} value={currentIntensity} step={0.1} onValueChange={changeLightIntensity}
                            inputWidth={6} className="h-fit rounded-none p-0.5 m-0" />
                    </span>
                </div>



            </div>
        </div>

    );

}
