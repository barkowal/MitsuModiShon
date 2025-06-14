import { useEffect, useState } from "react";
import type { TreeItem } from "../../utils/Types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ObjectList } from "./ObjectList";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";

type Props = {
  item: TreeItem,
  level: number
}

export function ObjectItem({ item, level }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<number>(0);

  const bgColor = item.id === selectedObjectId ? "var(--card)" : "";
  const dynamicStyling = {
    paddingLeft: `calc(var(--spacing) * 4 * ${level})`,
    backgroundColor: bgColor
  }

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const changeSelection = () => {
    editorEventBus.emit(EDITOR_EVENT.SelectObject, item.id);
  };

  useEffect(() => {
    const handleSelectObject = (id: number) => {
      setSelectedObjectId(id);
    };

    editorEventBus.on(EDITOR_EVENT.SelectObject, handleSelectObject);

    return () => {
      editorEventBus.off(EDITOR_EVENT.SelectObject, handleSelectObject);
    };

  }, [])

  return (<>
    <li className="">
      <div style={dynamicStyling} onClick={() => { changeSelection(); }}
        className="flex items-center justify-start px-2 py-1 hover:bg-card">
        {item.children && item.children.length > 0 ? (
          <span onClick={handleToggle}>
            {isExpanded ? <ChevronDown className="inline w-[2ch]" /> : <ChevronRight className="inline w-[2ch]" />}
          </span>
        ) :
          <span className="w-[2ch]"></span>
        }
        <p>{item.name}</p>
      </div>
      {item.children && isExpanded && <ObjectList treeList={item.children} level={level + 1} />}
    </li >
  </>);
}
