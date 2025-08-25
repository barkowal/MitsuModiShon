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
import { UserListFilter } from "@/pages/listPage/UserListFilter";

const USERS_OBJECTS3D_URL = "/api/v1/objects3D/private";
const USERS_OBJECTS3D_DOWNLOAD = "/api/v1/objects3D/download/users";

type Props = {
    addAnimation: boolean;
}

export function SmallUserMitsuListing({ addAnimation }: Props) {

    const { data: objectsData, isLoading, error, getData: getObjectsData } = useAuthGetFetch<MitsuShortObjectResponse>(USERS_OBJECTS3D_URL);
    const { response: downloadResponse, error: downloadError, makeRequest: makeDownloadRequest } = useAuthFetch(USERS_OBJECTS3D_DOWNLOAD);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchPublic, setSearchPublic] = useState<number>(3); // 3 - public and private, 2 - only public, 1-only private
    const [searchAnimated, setSearchAnimated] = useState<number>(1); // 3 - animated and non-animated, 2 - only animated, 1-only non animated 
    const pageLimit = 5;
    const lastPage = objectsData ? objectsData.data.result.pageData.lastPage : 1;

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);
        setCurrentPage(1);
    };

    const handlePublicFilter = (val: number) => {
        setSearchPublic(val);
        setCurrentPage(1);
    };

    const handleAnimatedFilter = (val: number) => {
        setSearchAnimated(val);
        setCurrentPage(1);
    };

    const handleDownload = (objectID: number) => {
        makeDownloadRequest(`/${objectID}`, "GET");
    };


    useEffect(() => {

        let url = `?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}`;

        if (searchPublic !== 3) {
            url += `&public=${searchPublic % 2 === 0}`;
        }
        if (searchAnimated !== 3) {
            url += `&animated=${searchAnimated % 2 === 0}`;
        }

        getObjectsData(url);

        if (downloadResponse) {
            editorEventBus.emit(addAnimation ? EDITOR_EVENT.UploadAnimationObject : EDITOR_EVENT.UploadObject, JSON.stringify(downloadResponse));
        }

    }, [getObjectsData, searchKeyword, currentPage, downloadResponse, searchPublic, searchAnimated, addAnimation]);


    return (
        <>

            <div className=" w-full my-2 flex justify-center gap-2">

                <SearchBar onSearch={handleSearch} minSearchWidth={"40ch"} />

                <UserListFilter onPublicFilterChange={handlePublicFilter} onAnimatedFilterChange={handleAnimatedFilter} />

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
