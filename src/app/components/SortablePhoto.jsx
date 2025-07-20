"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import placeholderImage from "./../assets/images/placeholder-cbs.png"

export default function SortablePhoto({ photo }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden shadow-lg hover:shadow-xl transition-all"
    >
      <Image
        src={photo.imageUrl || placeholderImage}
        alt={photo.caption || "Photo"}
        fill
        className="object-cover"
      />
    </div>
  )
}
