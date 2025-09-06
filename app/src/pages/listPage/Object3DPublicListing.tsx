import { LoadingText } from "@/components/LoadingText";
import { useAuthGetFetch } from "@/hooks/useAuthGetFetch";
import type { MitsuShortObjectData, MitsuShortObjectResponse } from "@/lib/types/ServerResponseTypes";
import { useEffect, useState } from "react";
import { ListPaginationComponent } from "@/components/ListPaginationComponent";
import { SearchBar } from "@/components/SearchBar";
import { ListCard } from "./listComponents/ListCard";
import { formatDateString } from "@/lib/utils";
import { ListFilter } from "./listComponents/ListFilter";
import { useTranslation } from "react-i18next";

const PUBLIC_OBJECTS3D_URL = "/api/v1/objects3D/public";
const PUBLIC_OBJECTS3D_DOWNLOAD = "/api/v1/objects3D/download/public";

export function Object3DPublicListing() {
  const { t } = useTranslation();
  const { data: objectsData, isLoading, error, getData: getObjectsData } = useAuthGetFetch<MitsuShortObjectResponse>(PUBLIC_OBJECTS3D_URL);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filters, setFilters] = useState([1]);
  const filterOptions = ["StaticObjects", "AnimatedObjects"];  // 3 - both filter options , 2 - only second , 1-only first 
  const pageLimit = 10;
  const lastPage = objectsData ? objectsData.data.result.pageData.lastPage : 1;

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  };

  const getCardDescription = (data: MitsuShortObjectData) => {
    return [
      t("MitsuModiShonObject"),
      `${t("PublishedBy")}: ${data.username}`,
    ];
  };

  const getDialogDescription = (data: MitsuShortObjectData) => {
    return [
      `${data.isAnimated ? t("AnimatedObject") : t("StaticObject")}`,
      `${t("PublishedBy")}: ${data.username}`,
      `${t("CreatedAt")}: ${formatDateString(data.createdAt.toString())}`,
    ];
  };

  useEffect(() => {

    if (filters[0] !== 3) {
      getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}&animated=${filters[0] % 2 === 0} `);
    } else {
      getObjectsData(`?search=${searchKeyword}&page=${currentPage}&per_page=${pageLimit}`);
    }

  }, [getObjectsData, searchKeyword, currentPage, filters]);

  return (
    <>

      <div className="w-full my-2 flex justify-center gap-2">

        <SearchBar onSearch={handleSearch} minSearchWidth="40ch" />

        <ListFilter filterOptions={filterOptions} onFilterChange={(filters: Array<number>) => { setFilters(filters); }} />

      </div >

      <div className="w-full">

        {
          error ?
            <span className="text-fail-primary w-full p-2 space-x-2 flex text-2xl justify-center items-center">
              <p>{t("SomethingWentWrong")} :(</p>
              <p>{objectsData?.message}</p>
            </span> :
            null
        }

        {
          isLoading ?
            <span className="w-full p-2 space-x-2 flex text-2xl justify-center items-center">
              <LoadingText LoadingText={t("Loading").toUpperCase()} />
            </span> :
            null
        }

        <div className="flex flex-col justify-between min-h-[800px]">
          <div>

            {
              objectsData ?
                <div className="p-2 w-[90%] m-auto flex items-start space-x-6 flex-wrap">
                  {objectsData.data.result.objects.map((objectData, i) =>
                    <ListCard
                      key={i}
                      data={objectData}
                      cardDescriptionTexts={getCardDescription(objectData)}
                      dialogDescriptionTexts={getDialogDescription(objectData)}
                      downloadUrl={PUBLIC_OBJECTS3D_DOWNLOAD}
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
