import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ItemProps {
  id: string;
  isActive?: boolean;
  label: string;
}

function Item({ id, isActive, label }: ItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: id });

  return (
    <span
      data-value={id}
      className={"item" + (isActive ? " active" : "")}
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition
      }}
      {...attributes}
      {...listeners}
    >
      <span>{label}</span>
    </span>
  );
}

export default Item;
