"use client"
import { useCallback, useEffect, useRef, useState } from "react"

export default function ContextMenu({
  anchor,
  items,
  longPressMs = 500,
  className = "",
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const pressTimer = useRef(null)

  const close = useCallback(() => setOpen(false), [])

  const place = useCallback((x, y) => {
    setCoords({ x, y })
    requestAnimationFrame(() => {
      const el = menuRef.current
      if (!el) return
      const { innerWidth, innerHeight } = window
      const r = el.getBoundingClientRect()
      const nx = Math.min(Math.max(8, x), innerWidth - r.width - 8)
      const ny = Math.min(Math.max(8, y), innerHeight - r.height - 8)
      setCoords({ x: nx, y: ny })
    })
  }, [])

  const openAt = (x, y) => {
    place(x, y)
    setOpen(true)
  }

  const onContextMenu = (e) => {
    e.preventDefault()
    openAt(e.clientX, e.clientY)
  }

  // long-press for touch/pen (don’t intercept mouse to preserve drag)
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse") return
    const { clientX, clientY } = e
    pressTimer.current = window.setTimeout(
      () => openAt(clientX, clientY),
      longPressMs
    )
  }

  const clearPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!menuRef.current?.contains(e.target)) close()
    }
    const onScroll = () => close()
    const onResize = () => close()
    document.addEventListener("mousedown", onDoc)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize, { passive: true })
    return () => {
      document.removeEventListener("mousedown", onDoc)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [open, close])

  return (
    <div
      ref={triggerRef}
      className="relative"
      onContextMenu={onContextMenu}
      onPointerDown={onPointerDown}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
    >
      {anchor}

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={`fixed z-50 min-w-48 rounded-sm border border-black/10 bg-white/95 shadow-xl backdrop-blur p-1 ${className}`}
          style={{ left: coords.x, top: coords.y }}
        >
          {items.map((it, i) =>
            it === "separator" ? (
              <div key={`sep-${i}`} className="my-1 h-px bg-gray-200" />
            ) : (
              <button
                key={it.id}
                role="menuitem"
                className={[
                  "w-full text-left text-sm rounded-xl px-3 py-2 select-none",
                  it.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-100 active:bg-gray-200",
                  it.danger && !it.disabled ? "text-red-600" : "",
                ].join(" ")}
                onClick={() => {
                  if (it.disabled) return
                  if (typeof it.onSelect === "function") it.onSelect()
                  close()
                }}
              >
                {it.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
