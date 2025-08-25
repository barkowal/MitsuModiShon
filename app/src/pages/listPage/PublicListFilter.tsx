import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Funnel } from "lucide-react";
import { useState } from "react";

type Props = {
  onAnimatedFilterChange: CallableFunction,
}

export function PublicListFilter({ onAnimatedFilterChange }: Props) {
  const [searchAnimated, setSearchAnimated] = useState<number>(1); // 3 - animated and non-animated, 2 - only animated, 1-only non animated 

  const filterAnimated = (val: number) => {
    const animateValue = searchAnimated + val;
    const value = animateValue === 0 ? 1 : animateValue;
    setSearchAnimated(value);
    onAnimatedFilterChange(value);
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
          checked={(searchAnimated & 1) === 1}
          onCheckedChange={(value) =>
            filterAnimated(value ? 1 : -1)
          }>
          Static Objects
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="capitalize"
          checked={(searchAnimated & 2) > 0}
          onCheckedChange={(value) =>
            filterAnimated(value ? 2 : -2)
          }>
          Animated Objects
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>

  </>);
}
