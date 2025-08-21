import { LoadingText } from "@/components/LoadingText";
import { useAuthGetFetch } from "@/hooks/useAuthGetFetch";
import type { MitsuShortObjectResponse } from "@/lib/types/ServerResponseTypes";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { MitsuObjectCard } from "./MitsuObjectCard";
import { ListPaginationComponent } from "@/components/ListPaginationComponent";
import { SearchBar } from "@/components/SearchBar";

const PUBLIC_OBJECTS3D_URL = "/api/v1/objects3D/public";

export function MitsuObjectsListing() {
  const { data: objectsData, isLoading, error, getData: getObjectsData } = useAuthGetFetch<MitsuShortObjectResponse>(PUBLIC_OBJECTS3D_URL);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const pageLimit = 10;
  const lastPage = objectsData ? objectsData.data.result.pageData.lastPage : 1;

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  useEffect(() => {

    getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}`);

  }, [getObjectsData, searchKeyword, currentPage]);

  return (
    <>

      <div className="w-11/12 my-2">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="w-11/12">

        {
          error ?
            <span className="text-destructive w-full p-2 space-x-2 flex text-2xl justify-center items-center">
              <p>Something went wrong. </p>
              <p>{objectsData?.message}</p>
            </span> :
            null
        }

        {
          isLoading ?
            <span className="text-chart-1 w-full p-2 space-x-2 flex text-2xl justify-center items-center">
              <LoadingText LoadingText="LOADING" />
            </span> :
            null
        }

        <div className="flex flex-col justify-between min-h-[800px]">
          <div>

            {
              objectsData ?
                <div className="p-2 w-[90%] m-auto flex items-start space-x-6 flex-wrap">
                  {objectsData.data.result.objects.map((objectData, i) =>
                    <MitsuObjectCard key={i} mitsuObjectData={objectData} />
                  )}
                </div>
                :
                null
            }

          </div>
        </div>

      </div>

      <div className="w-11/12 my-2">
        <ListPaginationComponent currentPage={currentPage} lastPage={lastPage} onPageChange={(page: number) => { setCurrentPage(page); }} />
      </div>

    </>);

}
