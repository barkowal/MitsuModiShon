import { ListPaginationComponent } from "@/components/ListPaginationComponent";
import { LoadingText } from "@/components/LoadingText";
import { SearchBar } from "@/components/SearchBar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuthGetFetch } from "@/hooks/useAuthGetFetch";
import type { AnimationSceneResponse } from "@/lib/types/ServerResponseTypes";
import { formatDateString } from "@/lib/utils";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";

const PUBLIC_SCENE_URL = "/api/v1/animationScene/public";
const PUBLIC_SCENE_DOWNLOAD = "/api/v1/animationScene/download/public";

export function SmallPublicSceneListing() {

    const { data: sceneData, isLoading, error, getData: getObjectsData } = useAuthGetFetch<AnimationSceneResponse>(PUBLIC_SCENE_URL);
    const { response: downloadResponse, error: downloadError, makeRequest: makeDownloadRequest } = useAuthFetch(PUBLIC_SCENE_DOWNLOAD);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [downloadConfirmation, setDownloadConfirmation] = useState(false);
    const [selectedSceneID, setSelectedSceneID] = useState(0);
    const pageLimit = 5;
    const lastPage = sceneData ? sceneData.data.result.pageData.lastPage : 1;

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);
        setCurrentPage(1);
    };

    const handleDownload = () => {
        if (selectedSceneID !== 0)
            makeDownloadRequest(`/${selectedSceneID}`, "GET");
    };

    useEffect(() => {

        getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}`);

        if (downloadResponse) {
            editorEventBus.emit(EDITOR_EVENT.LoadAnimationScene, JSON.stringify(downloadResponse));
        }

    }, [getObjectsData, searchKeyword, currentPage, downloadResponse]);


    return (
        <>

            <div className="w-full my-2 flex justify-center gap-2">

                <SearchBar onSearch={handleSearch} minSearchWidth="40ch" />

            </div >

            {
                error || downloadError ?
                    <span className="text-fail-primary w-full p-2 space-x-2 flex text-2xl justify-center items-center">
                        <p>Something went wrong. </p>
                        <p>{sceneData?.message}</p>
                    </span> :
                    null
            }

            {
                isLoading ?
                    <span className="w-full p-2 space-x-2 flex text-2xl justify-center items-center">
                        <LoadingText LoadingText="LOADING" />
                    </span> :
                    null
            }

            {
                sceneData ?
                    <Accordion type="single" collapsible>
                        {sceneData.data.result.scenes.map((scene, i) =>
                            <AccordionItem value={`item-${i}`} key={i} >
                                <AccordionTrigger>{scene.name}</AccordionTrigger>
                                <AccordionContent>
                                    <div className=" text-center flex-col justify-center items-center ">
                                        <p>Duration: {scene.duration.toString()}</p>
                                        <p>Created at: {formatDateString(scene.createdAt.toString())}</p>
                                        <div className="flex justify-center">
                                            <img src={"/api/v1/image" + scene.imgPath} width={128} height={128} className="aspect-square border border-primary" />
                                        </div>
                                        <Button
                                            onClick={() => { setSelectedSceneID(scene.id); setDownloadConfirmation(true); }}
                                            className="my-2 w-[20ch] font-bold ">LOAD SCENE</Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion >
                    :
                    null
            }

            {downloadConfirmation ?
                <div className="text-center">
                    <p>
                        Are you sure? All unsaved progress will be lost.
                    </p>
                    <span className="flex justify-evenly">
                        <Button onClick={() => { handleDownload(); }} className="my-2 w-[20ch] bg-destructive hover:bg-destructive/80 font-bold ">YES</Button>
                        <Button onClick={() => { setDownloadConfirmation(false); }} className="my-2 w-[20ch] font-bold ">CANCEL</Button>
                    </span>
                </div>
                : null
            }

            <div className="w-full my-2">
                <ListPaginationComponent currentPage={currentPage} lastPage={lastPage} onPageChange={(page: number) => { setCurrentPage(page); }} />
            </div>
        </>
    );


}
