import { LoadingText } from "@/components/LoadingText";
import { useAuthGetFetch } from "@/hooks/useAuthGetFetch";
import type { MitsuShortObjectResponse } from "@/lib/types/ServerResponseTypes";
import { useEffect, useState } from "react";
import { MitsuObjectCard } from "./MitsuObjectCard";
import { ListPaginationComponent } from "@/components/ListPaginationComponent";
import { SearchBar } from "@/components/SearchBar";
import { UserListFilter } from "./UserListFilter";

type Props = {
  url: string,
};

// TODO for now this is another component, in the future make it as one with public
// or not if it would make things too complex
export function MitsuUsersObjectsListing({ url }: Props) {
  const { data: objectsData, isLoading, error, getData: getObjectsData } = useAuthGetFetch<MitsuShortObjectResponse>(url);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchPublic, setSearchPublic] = useState<number>(1); // 3 - public and private, 2 - only public, 1-only private
  const pageLimit = 10;
  const lastPage = objectsData ? objectsData.data.result.pageData.lastPage : 1;

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const handlePublicFilter = (val: number) => {
    setSearchPublic(val);
    setCurrentPage(1);
  };

  useEffect(() => {

    if (searchPublic !== 3) {
      getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}&public=${searchPublic % 2 === 0} `);
    } else {
      getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}`);
    }

  }, [getObjectsData, searchKeyword, currentPage, searchPublic]);

  return (
    <>

      <div className="w-11/12 my-2 flex justify-center gap-2">

        <SearchBar onSearch={handleSearch} minSearchWidth="40ch" />

        <UserListFilter onPublicFilterChange={handlePublicFilter} />

      </div >

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
                    <MitsuObjectCard key={i} mitsuObjectData={objectData} isUsers={true} />
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
