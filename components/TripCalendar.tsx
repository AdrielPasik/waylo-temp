"use client"

import type React from "react"
import { useState } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
  isWithinInterval,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plane, Train, Bus, Car, Anchor, MapPin, Hotel } from "lucide-react"
import type { TripData } from "../types"

interface TripCalendarProps {
  trip: TripData
}

export const TripCalendar: React.FC<TripCalendarProps> = ({ trip }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-2xl font-bold text-slate-900 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  const renderDays = () => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    return (
      <div className="grid grid-cols-7 mb-2 border-b border-slate-100">
        {days.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
            {day}
          </div>
        ))}
      </div>
    )
  }

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "Vuelo":
        return <Plane className="w-3 h-3" />
      case "Tren":
        return <Train className="w-3 h-3" />
      case "Autobús":
        return <Bus className="w-3 h-3" />
      case "Coche":
        return <Car className="w-3 h-3" />
      case "Ferry":
        return <Anchor className="w-3 h-3" />
      default:
        return <Plane className="w-3 h-3" />
    }
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d")
        const cloneDay = day

        const stays = trip.destinations.filter((dest) => {
          try {
            return isWithinInterval(cloneDay, {
              start: parseISO(dest.arrivalDate),
              end: parseISO(dest.departureDate),
            })
          } catch (e) {
            return false
          }
        })

        const hotels = trip.accommodations.filter((acc) => {
          try {
            return isWithinInterval(cloneDay, {
              start: parseISO(acc.checkIn),
              end: parseISO(acc.checkOut),
            })
          } catch (e) {
            return false
          }
        })

        const transports = trip.transportation.filter((t) => {
          try {
            return isSameDay(cloneDay, parseISO(t.date))
          } catch (e) {
            return false
          }
        })

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[140px] p-2 border-r border-b border-slate-100 relative group transition-colors ${
              !isSameMonth(day, monthStart) ? "bg-slate-50/50" : "bg-white"
            }`}
          >
            <span
              className={`text-sm font-semibold ${!isSameMonth(day, monthStart) ? "text-slate-300" : "text-slate-700"}`}
            >
              {formattedDate}
            </span>

            <div className="mt-1 space-y-1">
              {stays.map((stay) => (
                <div
                  key={stay.id}
                  className="bg-blue-50 text-blue-700 text-[10px] p-1.5 rounded-md border border-blue-100 flex items-center gap-1 font-medium shadow-sm"
                >
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{stay.city}</span>
                </div>
              ))}

              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-indigo-50 text-indigo-700 text-[9px] p-1.5 rounded-md border border-indigo-100 flex items-center gap-1 font-bold shadow-sm"
                >
                  <Hotel className="w-2.5 h-2.5 flex-shrink-0" />
                  <span className="truncate">{hotel.name}</span>
                </div>
              ))}

              {transports.map((transport) => (
                <div
                  key={transport.id}
                  className="bg-emerald-50 text-emerald-700 text-[9px] p-1.5 rounded-md border border-emerald-100 font-medium shadow-sm"
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    {getTransportIcon(transport.type)}
                    <span className="font-bold">{transport.type}</span>
                  </div>
                  <div className="flex flex-col text-[8px] opacity-80 leading-tight">
                    <span className="flex justify-between">
                      <span>{transport.from}</span>
                      <span className="font-bold">{transport.departureTime}</span>
                    </span>
                    <span className="flex justify-between">
                      <span>{transport.to}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>,
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>,
      )
      days = []
    }

    return <div className="border-l border-t border-slate-100 rounded-xl overflow-hidden shadow-sm">{rows}</div>
  }

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      <div className="mt-6 flex flex-wrap gap-6 text-xs text-slate-500 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          <span>Ciudad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded"></div>
          <span>Hotel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></div>
          <span>Traslados</span>
        </div>
      </div>
    </div>
  )
}
