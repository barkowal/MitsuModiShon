import { LoadingText } from "@/components/LoadingText";
import { useAuthGetFetch } from "@/hooks/useAuthGetFetch";
import type { AnimationSceneData, AnimationSceneResponse } from "@/lib/types/ServerResponseTypes";
import { useEffect, useState } from "react";
import { ListPaginationComponent } from "@/components/ListPaginationComponent";
import { SearchBar } from "@/components/SearchBar";
import { formatDateString } from "@/lib/utils";
import { ListCard } from "./listComponents/ListCard";

const PUBLIC_SCENES_URL = "/api/v1/animationScene/public";
const PUBLIC_SCENES_DOWNLOAD = "/api/v1/animationScene/download/public";

export function AnimationSceneListing() {
  const { data: objectsData, isLoading, error, getData: getObjectsData } = useAuthGetFetch<AnimationSceneResponse>(PUBLIC_SCENES_URL);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const pageLimit = 10;
  const lastPage = objectsData ? objectsData.data.result.pageData.lastPage : 1;

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const getCardDescription = (data: AnimationSceneData) => {
    return [
      `Animation Scene`,
      `Published By: ${data.username}`,
      `Duration: ${data.duration}`
    ];
  };

  const getDialogDescription = (data: AnimationSceneData) => {
    return [
      `Animation Scene`,
      `Published By: ${data.username}`,
      `Duration: ${data.duration}`,
      `Created At: ${formatDateString(data.createdAt.toString())}`,
    ];
  };

  useEffect(() => {

    getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}`);

  }, [getObjectsData, searchKeyword, currentPage]);

  return (
    <>

      <div className="w-full my-2 flex justify-center gap-2">

        <SearchBar onSearch={handleSearch} minSearchWidth="50ch" />

      </div >

      <div className="w-11/12">

        {
          error ?
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

        <div className="flex flex-col justify-between min-h-[800px]">
          <div>

            {
              objectsData ?
                <div className="p-2 w-[90%] m-auto flex items-start space-x-6 flex-wrap">
                  {objectsData.data.result.scenes.map((objectData, i) =>
                    <ListCard
                      key={i}
                      data={objectData}
                      cardDescriptionTexts={getCardDescription(objectData)}
                      dialogDescriptionTexts={getDialogDescription(objectData)}
                      downloadUrl={PUBLIC_SCENES_DOWNLOAD}
                      isUsers={false}
                    />
                  )}
                </div>
                :
                null
            }

          </div>
        </div>

      </div>

      <div className="w-full my-2">
        <ListPaginationComponent currentPage={currentPage} lastPage={lastPage} onPageChange={(page: number) => { setCurrentPage(page); }} />
      </div>

    </>);

}
