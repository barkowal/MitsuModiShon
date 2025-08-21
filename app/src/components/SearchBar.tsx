import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

type Props = {
  onSearch: CallableFunction
}

export function SearchBar({ onSearch }: Props) {
  const [search, setSearch] = useState("");

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key == "Enter") {
      onSearch(search.toLowerCase());
    }
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <Input type="search" className="w-[30%] min-w-[50ch] rounded-r-none" placeholder="SEARCH"
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

