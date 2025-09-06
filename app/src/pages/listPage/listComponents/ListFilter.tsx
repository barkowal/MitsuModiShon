import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Funnel } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  filterOptions: Array<string>,
  onFilterChange: CallableFunction,
}

export function ListFilter({ filterOptions, onFilterChange }: Props) {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<Array<number>>(Array(filterOptions.length / 2).fill(1));

  const changeFilter = (filterIndex: number, setValue: number) => {
    const filterValue = filters[filterIndex] + setValue;
    const newValue = filterValue === 0 ? 1 : filterValue;

    setFilters(prevNumbers =>
      prevNumbers.map((num, index) => (index === filterIndex ? newValue : num))
    );

    onFilterChange(filters.map((num, index) => (index === filterIndex ? newValue : num)));
  };

  return (<>
    <DropdownMenu>

      <DropdownMenuTrigger asChild >
        <Button variant="outline">
          <Funnel />{t("Filters").toUpperCase()}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>

        {
          filters.map((filter, i) => (

            <div key={i}>
              < DropdownMenuCheckboxItem
                className="capitalize"
                checked={(filter & 1) === 1}
                onCheckedChange={(value) =>
                  changeFilter(i, value ? 1 : -1)
                }>
                {t(filterOptions[i * 2])}
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                className="capitalize"
                checked={(filter & 2) > 0}
                onCheckedChange={(value) =>
                  changeFilter(i, value ? 2 : -2)
                }>
                {t(filterOptions[i * 2 + 1])}
              </DropdownMenuCheckboxItem>

              {
                i != filters.length - 1 ?
                  <DropdownMenuSeparator />
                  : null
              }

            </div>

          ))
        }

      </DropdownMenuContent >
    </DropdownMenu >

  </>);
}
