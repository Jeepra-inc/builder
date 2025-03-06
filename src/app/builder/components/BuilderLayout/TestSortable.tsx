// "use client";
// import React, { useState } from 'react';
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
//   DragStartEvent,
// } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   useSortable,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

// // Enhanced sortable item component with visual feedback
// const SortableItem = ({ id }: { id: string }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//     over,
//   } = useSortable({ id });

//   // Log any updates for debugging
//   React.useEffect(() => {
//     if (isDragging) {
//       console.log(`TestItem ${id} is being dragged`);
//     }
//     if (over) {
//       console.log(`TestItem ${id} has over:`, over.id);
//     }
//   }, [id, isDragging, over]);

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     zIndex: isDragging ? 100 : 1,
//     position: isDragging ? 'relative' : 'static' as any,
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       className={`p-4 mb-2 rounded-md shadow-md flex items-center ${isDragging ? 'border-2 border-blue-500 bg-blue-50 shadow-lg' : 'bg-white border border-gray-200'}`}
//     >
//       <div className="mr-2 p-1 rounded bg-gray-100">
//         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
//           <line x1="21" y1="10" x2="3" y2="10"></line>
//           <line x1="21" y1="6" x2="3" y2="6"></line>
//           <line x1="21" y1="14" x2="3" y2="14"></line>
//           <line x1="21" y1="18" x2="3" y2="18"></line>
//         </svg>
//       </div>
//       <span className={`font-medium ${isDragging ? 'text-blue-700' : 'text-gray-700'}`}>Item {id}</span>
//     </div>
//   );
// };

// // Simple sortable list component for testing
// export function TestSortable() {
//   const [items, setItems] = useState(['1', '2', '3', '4', '5']);

//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   function handleDragStart(event: DragStartEvent) {
//     console.log('===== Test drag START =====');
//     console.log('Active:', event.active);
//   }

//   function handleDragEnd(event: DragEndEvent) {
//     const { active, over } = event;
//     console.log('===== Test drag END =====');
//     console.log('Active:', active);
//     console.log('Over:', over);

//     if (over && active.id !== over.id) {
//       setItems((items) => {
//         const oldIndex = items.indexOf(active.id.toString());
//         const newIndex = items.indexOf(over.id.toString());

//         console.log(`Successfully reordering: Moving from index ${oldIndex} to ${newIndex}`);
//         return arrayMove(items, oldIndex, newIndex);
//       });
//     } else {
//       console.log('No reordering needed - either no target or same item');
//     }
//   }

//   return (
//     <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', border: '2px solid #3b82f6', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
//       <h2 style={{ marginBottom: '16px', color: '#1d4ed8', borderBottom: '1px solid #dbeafe', paddingBottom: '8px' }}>Test Sortable List</h2>
//       <p style={{ marginBottom: '16px', fontSize: '14px', color: '#4b5563' }}>This is a test component to verify drag-and-drop functionality. Try dragging these items to reorder them.</p>
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragStart={handleDragStart}
//         onDragEnd={handleDragEnd}
//       >
//         <SortableContext
//           items={items}
//           strategy={verticalListSortingStrategy}
//         >
//           <div style={{ display: 'flex', flexDirection: 'column' }}>
//             {items.map((id) => (
//               <SortableItem key={id} id={id} />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// }
