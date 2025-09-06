import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  onSearch: CallableFunction,
  minSearchWidth?: string,
}

export function SearchBar({ onSearch, minSearchWidth = "50ch" }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key == "Enter") {
      onSearch(search.toLowerCase());
    }
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <Input type="search" className="w-[30%] rounded-r-none" style={{ minWidth: minSearchWidth }} placeholder={t("Search")}
          onChange={(event) => { setSearch(event ? event.target.value : ""); }}
          onKeyDown={(e: React.KeyboardEvent) => { handleKey(e); }} />
        <Button variant="outline" className="border rounded-l-none cursor-pointer"
          onClick={() => { onSearch(search); }}>
          <Search />
        </Button>
      </div>
    </>
  );

}

