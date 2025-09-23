"use client"
import { useState, useEffect, useRef } from "react"
import dayjs from "dayjs"
import DATE_FORMATS from "./../db/date-formats"
import MONTHS_SHORT from "./../db/months-short"
import MONTHS_LONG from "./../db/months-long"

function getDecadeYears(startYear) {
  return Array.from({ length: 10 }, (_, i) => startYear + i)
}

export default function DatePicker({
  anchorRef,
  isOpen,
  onClose,
  initialDate = null,
  outputFormat = "EEE_D_MMM_YYYY",
  onDateSelected,
}) {
  const today = dayjs()
  const [step, setStep] = useState("year") // year → month → day
  const [currentDecadeStart, setCurrentDecadeStart] = useState(
    Math.floor(today.year() / 10) * 10
  )
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [pickedDate, setPickedDate] = useState(
    initialDate ? dayjs(initialDate) : null
  )

  const menuRef = useRef(null)

  // ✅ Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  // ✅ Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep("year")
      setSelectedYear(null)
      setSelectedMonth(null)
      setSelectedDay(null)
    }
  }, [isOpen])

  const handleYearSelect = (year) => {
    setSelectedYear(year)
    setStep("month")
  }

  const handleMonthSelect = (monthIdx) => {
    setSelectedMonth(monthIdx)
    setStep("day")
  }

  const handleDaySelect = (day, year = selectedYear, month = selectedMonth) => {
    setSelectedYear(year)
    setSelectedMonth(month)
    setSelectedDay(day)

    const finalDate = dayjs().year(year).month(month).date(day)

    setPickedDate(finalDate)

    const formatted = finalDate.format(DATE_FORMATS[outputFormat])
    onDateSelected?.({
      iso: finalDate.toISOString(),
      formatted,
    })

    onClose()
  }

  const handleTodaySelect = () => {
    handleDaySelect(today.date(), today.year(), today.month())
  }

  const daysInMonth =
    selectedYear !== null && selectedMonth !== null
      ? dayjs().year(selectedYear).month(selectedMonth).daysInMonth()
      : 0

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute mt-2 bg-white p-4 rounded-sm-lg shadow-lg w-80 z-50"
      style={{
        top: anchorRef.current?.offsetHeight ?? 0,
        left: 0,
      }}
    >
      {/* ✅ Selected Preview */}
      {pickedDate ? (
        <div className="text-center text-sm text-carbon-blue-500 mb-2">
          Selected:{" "}
          <span className="font-semibold">
            {pickedDate.format(DATE_FORMATS[outputFormat])}
          </span>
        </div>
      ) : (
        <div className="text-center text-sm text-gray-400 mb-2">
          No date selected
        </div>
      )}

      {/* ✅ Year selector */}
      {step === "year" && (
        <>
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setCurrentDecadeStart((prev) => prev - 10)}
              className="text-sm text-carbon-blue-500 hover:underline"
            >
              ← Prev
            </button>
            <span className="font-bold">
              {currentDecadeStart} - {currentDecadeStart + 9}
            </span>
            <button
              onClick={() => setCurrentDecadeStart((prev) => prev + 10)}
              className="text-sm text-carbon-blue-500 hover:underline"
            >
              Next →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {getDecadeYears(currentDecadeStart).map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className="p-2 bg-neutral-100 rounded-sm hover:bg-neutral-300"
              >
                {year}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ✅ Month selector */}
      {step === "month" && (
        <>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => setStep("year")}
              className="text-sm text-carbon-blue-500 hover:underline"
            >
              ← Years
            </button>
            <div className="font-bold">{selectedYear}</div>
            <span></span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTHS_SHORT.map((m, idx) => (
              <button
                key={m}
                onClick={() => handleMonthSelect(idx)}
                className="p-2 bg-neutral-100 rounded-sm hover:bg-neutral-300"
              >
                {m}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ✅ Day selector */}
      {step === "day" && (
        <>
          <div className="flex justify-between mb-2">
            <button
              onClick={() => setStep("month")}
              className="text-sm text-carbon-blue-500 hover:underline"
            >
              ← Months
            </button>
            <div className="font-bold">
              {MONTHS_LONG[selectedMonth]} {selectedYear}
            </div>
            <span></span>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => handleDaySelect(day)}
                className="p-2 bg-neutral-100 rounded-sm hover:bg-neutral-300 text-sm"
              >
                {day}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ✅ Today Button */}
      <div className="mt-3 text-center">
        <button
          onClick={handleTodaySelect}
          className="px-3 py-1 bg-carbon-blue-500 text-white rounded-sm hover:bg-carbon-blue-600 text-sm"
        >
          Today ({today.format("DD MMM YYYY")})
        </button>
      </div>
    </div>
  )
}
