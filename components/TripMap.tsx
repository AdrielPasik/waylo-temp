"use client"

import type React from "react"
import type { TripDestination } from "../types"
import { MapPin } from "lucide-react"

interface TripMapProps {
  destinations: TripDestination[]
}

export const TripMap: React.FC<TripMapProps> = ({ destinations }) => {
  const generateMapUrl = () => {
    if (destinations.length === 0) return ""

    // Sort destinations by arrival date
    const sortedDest = [...destinations].sort(
      (a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime(),
    )

    // Create markers for all destinations
    const markers = sortedDest.map((dest) => `${encodeURIComponent(dest.city + ", " + dest.country)}`).join("|")

    // Use the first destination as center
    const center = `${encodeURIComponent(sortedDest[0].city + ", " + sortedDest[0].country)}`

    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${center}&zoom=4`
  }

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
      {destinations.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">
              Agrega ciudades para ver tu ruta en el mapa
            </p>
          </div>
        </div>
      ) : (
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: "500px" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={generateMapUrl()}
          title="Mapa de destinos"
        />
      )}
    </div>
  )
}
