import { useEffect, useState, type MouseEvent } from "react";
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
  const [selectedObjectsId, setSelectedObjectsId] = useState<Array<number>>([0]);

  const bgColor = selectedObjectsId.includes(item.id) ? "var(--card)" : "";
  const dynamicStyling = {
    paddingLeft: `calc(var(--spacing) * 4 * ${level})`,
    backgroundColor: bgColor
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!e.dataTransfer) {
      return;
    }
    const droppedItemsId = Number(e.dataTransfer.getData("itemID"));
    if (droppedItemsId !== item.id) {
      editorEventBus.emit(EDITOR_EVENT.AttachToObject, [item.id, droppedItemsId]);
    }
  };

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  const changeSelection = (e: MouseEvent) => {
    if (e.shiftKey) {
      editorEventBus.emit(EDITOR_EVENT.AddSelection, item.id);
    } else {
      editorEventBus.emit(EDITOR_EVENT.SelectObject, item.id);
    }
  };

  useEffect(() => {
    const handleRefreshSelections = (ids: Array<number>) => {
      setSelectedObjectsId(ids);
    };

    editorEventBus.on(EDITOR_EVENT.RefreshSelections, handleRefreshSelections);

    return () => {
      editorEventBus.off(EDITOR_EVENT.RefreshSelections, handleRefreshSelections);
    };

  }, []);

  return (<>
    <li>
      <div
        draggable="true"
        onDragStart={(event) => { event.dataTransfer.setData("itemId", item.id.toString()); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        style={dynamicStyling}
        onClick={(e: MouseEvent) => { changeSelection(e); }}
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
