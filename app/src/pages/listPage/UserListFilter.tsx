import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Funnel } from "lucide-react";
import { useState } from "react";

type Props = {
  onPublicFilterChange: CallableFunction,
}

export function UserListFilter({ onPublicFilterChange }: Props) {
  const [searchPublic, setSearchPublic] = useState<number>(1); // 3 - public and private, 2 - only public, 1-only private

  const filterPublic = (val: number) => {
    const publicValue = searchPublic + val;
    const value = publicValue === 0 ? 1 : publicValue;
    setSearchPublic(value);
    onPublicFilterChange(value);
  };

  return (<>
    <DropdownMenu>
      <DropdownMenuTrigger asChild >
        <Button variant="outline">
          <Funnel />Show
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          className="capitalize"
          checked={(searchPublic & 1) === 1}
          onCheckedChange={(value) =>
            filterPublic(value ? 1 : -1)
          }>
          Private
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="capitalize"
          checked={(searchPublic & 2) > 0}
          onCheckedChange={(value) =>
            filterPublic(value ? 2 : -2)
          }>
          Public
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>

  </>);
}
