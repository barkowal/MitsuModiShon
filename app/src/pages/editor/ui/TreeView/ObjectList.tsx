import type { TreeItem } from "../../utils/Types";
import { ObjectItem } from "./ObjectItem";

type Props = {
  treeList: Array<TreeItem>;
  level: number;
}

export function ObjectList({ treeList, level }: Props) {
  return (<>
    <ul className="select-none">
      {treeList.map((listItem, index) => (
        <ObjectItem key={index} item={listItem} level={level} />
      ))}
    </ul>
  </>);
}
