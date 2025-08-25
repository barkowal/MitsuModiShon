import { LoadingText } from "@/components/LoadingText";
import { useAuthGetFetch } from "@/hooks/useAuthGetFetch";
import type { MitsuShortObjectResponse } from "@/lib/types/ServerResponseTypes";
import { useEffect, useState } from "react";
import { MitsuObjectCard } from "./MitsuObjectCard";
import { ListPaginationComponent } from "@/components/ListPaginationComponent";
import { SearchBar } from "@/components/SearchBar";
import { PublicListFilter } from "./PublicListFilter";

type Props = {
  url: string,
};

export function MitsuObjectsListing({ url }: Props) {
  const { data: objectsData, isLoading, error, getData: getObjectsData } = useAuthGetFetch<MitsuShortObjectResponse>(url);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchAnimated, setSearchAnimated] = useState<number>(1); // 3 - animated and non-animated, 2 - only animated, 1-only non animated 
  const pageLimit = 10;
  const lastPage = objectsData ? objectsData.data.result.pageData.lastPage : 1;

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handleAnimatedFilter = (val: number) => {
    setSearchAnimated(val);
    setCurrentPage(1);
  };

  useEffect(() => {

    if (searchAnimated !== 3) {
      getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}&animated=${searchAnimated % 2 === 0} `);
    } else {
      getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}`);
    }

  }, [getObjectsData, searchKeyword, currentPage, searchAnimated]);

  return (
    <>

      <div className="w-full my-2 flex justify-center gap-2">

        <SearchBar onSearch={handleSearch} minSearchWidth="40ch" />

        <PublicListFilter onAnimatedFilterChange={handleAnimatedFilter} />

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

      <div className="w-full my-2">
        <ListPaginationComponent currentPage={currentPage} lastPage={lastPage} onPageChange={(page: number) => { setCurrentPage(page); }} />
      </div>

    </>);

}
