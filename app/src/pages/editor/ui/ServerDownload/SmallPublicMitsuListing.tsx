import { ListPaginationComponent } from "@/components/ListPaginationComponent";
import { LoadingText } from "@/components/LoadingText";
import { SearchBar } from "@/components/SearchBar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuthGetFetch } from "@/hooks/useAuthGetFetch";
import type { MitsuShortObjectResponse } from "@/lib/types/ServerResponseTypes";
import { formatDateString } from "@/lib/utils";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";

const PUBLIC_OBJECTS3D_URL = "/api/v1/objects3D/public";
const PUBLIC_OBJECTS3D_DOWNLOAD = "/api/v1/objects3D/download/public";

export function SmallPublicMitsuListing() {

    const { data: objectsData, isLoading, error, getData: getObjectsData } = useAuthGetFetch<MitsuShortObjectResponse>(PUBLIC_OBJECTS3D_URL);
    const { response: downloadResponse, error: downloadError, makeRequest: makeDownloadRequest } = useAuthFetch(PUBLIC_OBJECTS3D_DOWNLOAD);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const pageLimit = 5;
    const lastPage = objectsData ? objectsData.data.result.pageData.lastPage : 1;

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);
        setCurrentPage(1);
    };

    const handleDownload = (objectID: number) => {
        makeDownloadRequest(`/${objectID}`, "GET");
    };

    useEffect(() => {

        getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}`);

        if (downloadResponse) {
            editorEventBus.emit(EDITOR_EVENT.UploadObject, JSON.stringify(downloadResponse));
        }

    }, [getObjectsData, searchKeyword, currentPage, downloadResponse]);


    return (
        <>

            <div className="w-full my-2">
                <SearchBar onSearch={handleSearch} />
            </div>

            {
                error || downloadError ?
                    <span className="text-fail-primary w-full p-2 space-x-2 flex text-2xl justify-center items-center">
                        <p>Something went wrong. </p>
                        <p>{objectsData?.message}</p>
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
                objectsData ?
                    <Accordion type="single" collapsible>
                        {objectsData.data.result.objects.map((objectData, i) =>
                            <AccordionItem value={`item-${i}`} key={i} >
                                <AccordionTrigger>{objectData.name}</AccordionTrigger>
                                <AccordionContent>
                                    <div className=" text-center flex-col justify-center items-center ">
                                        <p>Created at: {formatDateString(objectData.createdAt.toString())}</p>
                                        <p>Visibility: {objectData.isPublic ? "Public" : "Private"}</p>
                                        <div className="flex justify-center">
                                            <img src={"/api/v1/image" + objectData.imgPath} width={128} height={128} className="aspect-square border border-primary" />
                                        </div>
                                        <Button onClick={() => { handleDownload(objectData.id); }} className="my-2 w-[20ch] font-bold ">ADD TO SCENE</Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion >
                    :
                    null
            }

            <div className="w-11/12 my-2">
                <ListPaginationComponent currentPage={currentPage} lastPage={lastPage} onPageChange={(page: number) => { setCurrentPage(page); }} />
            </div>
        </>
    );


}
