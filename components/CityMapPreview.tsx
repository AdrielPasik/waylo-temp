"use client"

import type React from "react"
import { MapPin } from "lucide-react"

interface CityMapPreviewProps {
  city: string
  country: string
}

export const CityMapPreview: React.FC<CityMapPreviewProps> = ({ city, country }) => {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(city + ", " + country)}&zoom=12`

  return (
    <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border-2 border-[#f47b20]/20 relative">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title={`Mapa de ${city}`}
      />
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#f47b20]" />
        <div>
          <p className="font-black text-[#0a1628] text-sm">{city}</p>
          <p className="text-xs text-blue-600 font-bold">{country}</p>
        </div>
      </div>
    </div>
  )
}
