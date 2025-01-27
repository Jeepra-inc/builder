import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

interface ContainerProps {
  children: React.ReactNode;
  id: string;
  items: any[];
}

function Container({ children, id, items }: ContainerProps) {
  const { setNodeRef } = useDroppable({ id: id });
  const align = id.split("_")[id.split("_").length - 1];

  return (
    <SortableContext id={id} items={items}>
      <div
        ref={setNodeRef}
        data-container={id}
        className={"container " + align}
      >
        {children}
      </div>
    </SortableContext>
  );
}

export default Container;
