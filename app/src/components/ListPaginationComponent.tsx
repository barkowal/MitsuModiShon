import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type Props = {
  currentPage: number,
  lastPage: number,
  onPageChange: CallableFunction,
}

export function ListPaginationComponent({ currentPage, lastPage, onPageChange }: Props) {
  const prevPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
  const nextPage = currentPage + 1 <= lastPage ? currentPage + 1 : lastPage;

  const showPreviousPage: boolean = currentPage > 1;
  const showNextPage: boolean = nextPage > currentPage;
  const showLastPage: boolean = nextPage < lastPage;
  const showFirstPage: boolean = prevPage > 1;

  const handlePreviousPage = () => {
    if (currentPage - 1 >= 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage + 1 <= lastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const changePage = (page: number) => {
    onPageChange(page);
  };

  return (
    <Pagination>
      <PaginationContent>

        <PaginationItem>
          <PaginationPrevious onClick={() => { handlePreviousPage(); }} />
        </PaginationItem>

        {
          showFirstPage ?
            <>
              <PaginationItem>
                <PaginationLink onClick={() => { changePage(1); }}>1</PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
            : null
        }

        {
          showPreviousPage ?
            <PaginationItem>
              <PaginationLink onClick={() => { changePage(prevPage); }} >{prevPage}</PaginationLink>
            </PaginationItem>
            : null
        }

        <PaginationItem>
          <PaginationLink isActive>{currentPage}</PaginationLink>
        </PaginationItem>

        {
          showNextPage ?
            <PaginationItem>
              <PaginationLink onClick={() => { changePage(nextPage); }} >{nextPage}</PaginationLink>
            </PaginationItem>
            : null
        }

        {
          showLastPage ?
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink onClick={() => { changePage(lastPage); }} >{lastPage}</PaginationLink>
              </PaginationItem>
            </>

            : null
        }

        <PaginationItem>
          <PaginationNext onClick={() => { handleNextPage(); }} />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  );
}
