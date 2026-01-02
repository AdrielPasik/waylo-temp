"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Plane,
  CreditCard,
  Hotel,
  Plus,
  Trash2,
  LayoutDashboard,
  CalendarIcon,
  MapIcon,
  Edit2,
  Check,
  Upload,
  DollarSign,
  ListTodo,
  Briefcase,
  X,
  Menu,
} from "lucide-react"
import type { Trip } from "../types"
import { DashboardCard } from "../components/DashboardCard"
import { ExpenseChart } from "../components/ExpenseChart"
import { TripCalendar } from "../components/TripCalendar"
import { TripMap } from "../components/TripMap"
import { CityMapPreview } from "../components/CityMapPreview"

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  ARS: 0.0011,
}

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "ARS", symbol: "AR$" },
]

const CATEGORIES = ["Transporte", "Alojamiento", "Comida", "Actividades", "Otros"]
const TRANSPORT_TYPES = ["Vuelo", "Tren", "Autobús", "Coche", "Ferry"]

const WayloLogoUploader = ({ logo, onUpload }: { logo?: string; onUpload: (base64: string) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => onUpload(reader.result as string)
      reader.readAsDataURL(file)
    }
  }
  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className="relative w-full aspect-square bg-[#0a1628] rounded-[2.5rem] mb-10 shadow-2xl border border-white/5 overflow-hidden group cursor-pointer flex flex-col items-center justify-center transition-all hover:border-[#f47b20]/50"
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      {logo ? (
        <img src={logo || "/placeholder.svg"} alt="Waylo Logo" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <Upload className="w-8 h-8 text-white/20 group-hover:text-[#f47b20]" />
          <p className="text-white font-black text-[10px] uppercase tracking-widest">Logo Viaje</p>
        </div>
      )}
    </div>
  )
}

const WayloApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "resumen" | "itinerario" | "logistica" | "calendario" | "mapa" | "presupuesto"
  >("resumen")

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [trip, setTrip] = useState<Trip>({
    title: "Mi Eurotrip 2025",
    budget: 5000,
    destinations: [],
    expenses: [],
    transportation: [],
    accommodations: [],
  })

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(trip.title)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [tempBudget, setTempBudget] = useState(trip.budget.toString())

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"dest" | "expense" | "transport" | "hotel" | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<{ city: string; country: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("waylo_v10_data")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTrip(parsed)
        setTempTitle(parsed.title)
        setTempBudget(parsed.budget.toString())
      } catch (e) {
        console.error("Failed to parse saved data:", e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("waylo_v10_data", JSON.stringify(trip))
  }, [trip])

  const saveTitle = () => {
    setTrip((prev) => ({ ...prev, title: tempTitle }))
    setIsEditingTitle(false)
  }
  const saveBudget = () => {
    const val = Number.parseFloat(tempBudget)
    if (!isNaN(val)) setTrip((prev) => ({ ...prev, budget: val }))
    setIsEditingBudget(false)
  }

  const handleAddOrEditDestination = async (data: {
    city: string
    country: string
    arrivalDate: string
    departureDate: string
    notes?: string
  }) => {
    if (editingId) {
      setTrip((prev) => ({
        ...prev,
        destinations: prev.destinations.map((d) => (d.id === editingId ? { ...data, id: editingId } : d)),
      }))
    } else {
      setTrip((prev) => ({
        ...prev,
        destinations: [...prev.destinations, { ...data, id: crypto.randomUUID() }],
      }))
    }
    setIsModalOpen(false)
    setEditingId(null)
    setSelectedCity(null)
  }

  const addOrUpdateExpense = (data: any) => {
    if (editingId) {
      setTrip((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === editingId ? { ...data, id: editingId } : e)),
      }))
    } else {
      setTrip((prev) => ({ ...prev, expenses: [...prev.expenses, { ...data, id: crypto.randomUUID() }] }))
    }
    setEditingId(null)
  }

  const syncLogisticsToExpense = (
    linkedId: string,
    desc: string,
    category: any,
    amount: number,
    currency: string,
    date: string,
  ) => {
    setTrip((prev) => {
      const filteredExpenses = prev.expenses.filter((e) => e.linkedId !== linkedId)
      if (amount > 0) {
        return {
          ...prev,
          expenses: [
            ...filteredExpenses,
            {
              id: crypto.randomUUID(),
              linkedId,
              description: desc,
              category,
              amount,
              currency,
              date,
            },
          ],
        }
      }
      return { ...prev, expenses: filteredExpenses }
    })
  }

  const addOrUpdateTransport = (data: any) => {
    const transportId = editingId || crypto.randomUUID()
    const newTransport = { ...data, id: transportId }

    setTrip((prev) => ({
      ...prev,
      transportation: editingId
        ? prev.transportation.map((t) => (t.id === editingId ? newTransport : t))
        : [...prev.transportation, newTransport],
    }))

    if (data.cost && data.cost > 0) {
      syncLogisticsToExpense(
        transportId,
        `Transporte: ${data.type} (${data.from} - ${data.to})`,
        "Transporte",
        data.cost,
        data.currency,
        data.date,
      )
    }
    setEditingId(null)
  }

  const addOrUpdateHotel = (data: any) => {
    const hotelId = editingId || crypto.randomUUID()
    const newHotel = { ...data, id: hotelId }

    setTrip((prev) => ({
      ...prev,
      accommodations: editingId
        ? prev.accommodations.map((a) => (a.id === editingId ? newHotel : a))
        : [...prev.accommodations, newHotel],
    }))

    if (data.cost && data.cost > 0) {
      syncLogisticsToExpense(
        hotelId,
        `Alojamiento: ${data.name} (${data.city})`,
        "Alojamiento",
        data.cost,
        data.currency,
        data.checkIn,
      )
    }
    setEditingId(null)
  }

  const deleteItem = (type: "destinations" | "expenses" | "transportation" | "accommodations", id: string) => {
    setTrip((prev) => {
      let nextExpenses = prev.expenses
      if (type !== "expenses") {
        nextExpenses = prev.expenses.filter((e) => e.linkedId !== id)
      }
      return {
        ...prev,
        [type]: (prev[type] as any[]).filter((item) => item.id !== id),
        expenses: nextExpenses,
      }
    })
  }

  const totalSpentUSD = trip.expenses.reduce((sum, e) => sum + e.amount * (EXCHANGE_RATES[e.currency] || 1), 0)
  const remainingBudget = trip.budget - totalSpentUSD

  return (
    // Mobile header with menu button
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a1628] text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {trip.logo && (
            <img src={trip.logo || "/placeholder.svg"} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          )}
          <span className="font-black text-sm uppercase tracking-wider text-[#f47b20]">Waylo</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40
            w-full lg:w-80 h-screen
            bg-[#0a1628] text-white p-6 
            flex flex-col shadow-2xl
            transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${isMobileMenuOpen ? "mt-14" : "lg:mt-0"}
          `}
        >
          <div className="hidden lg:block mb-6">
            <WayloLogoUploader logo={trip.logo} onUpload={(b64) => setTrip((prev) => ({ ...prev, logo: b64 }))} />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
            {[
              { id: "resumen", icon: LayoutDashboard, label: "Panel Principal" },
              { id: "itinerario", icon: ListTodo, label: "Mi Itinerario" },
              { id: "logistica", icon: Briefcase, label: "Logística" },
              { id: "calendario", icon: CalendarIcon, label: "Calendario" },
              { id: "mapa", icon: MapIcon, label: "Mapa" },
              { id: "presupuesto", icon: CreditCard, label: "Gastos (USD)" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-4 px-4 lg:px-6 py-3 lg:py-4 rounded-2xl transition-all ${
                  activeTab === item.id
                    ? "bg-[#f47b20] text-white shadow-lg shadow-orange-500/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 p-4 lg:p-6 bg-white/5 rounded-2xl border border-white/10 group">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 text-center">
              Presupuesto Inicial
            </p>
            <div className="text-center mb-4">
              {isEditingBudget ? (
                <input
                  autoFocus
                  type="number"
                  className="bg-white/10 text-white font-black text-lg w-full text-center rounded-xl py-1 outline-none focus:ring-2 ring-[#f47b20]"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  onBlur={saveBudget}
                  onKeyDown={(e) => e.key === "Enter" && saveBudget()}
                />
              ) : (
                <div
                  className="flex items-center justify-center gap-2 cursor-pointer py-1"
                  onClick={() => setIsEditingBudget(true)}
                >
                  <h4 className="text-xl font-black text-white">${trip.budget.toLocaleString()}</h4>
                  <Edit2 className="w-3 h-3 text-[#f47b20] opacity-0 group-hover:opacity-100" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Restante (USD)</p>
              <h4
                className={`text-xl lg:text-2xl font-black ${remainingBudget < 0 ? "text-red-400" : "text-[#f47b20]"}`}
              >
                ${remainingBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h4>
            </div>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <main className="flex-1 w-full pt-16 lg:pt-0">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <header className="mb-6 lg:mb-12 flex flex-col gap-4 lg:gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-1 w-6 lg:w-8 bg-[#f47b20] rounded-full"></span>
                  <p className="text-[9px] lg:text-[10px] font-black text-[#f47b20] uppercase tracking-[0.3em]">
                    Waylo Travel
                  </p>
                </div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 lg:gap-4">
                    <input
                      autoFocus
                      className="text-2xl sm:text-3xl lg:text-5xl font-black bg-white border-b-2 border-[#f47b20] outline-none w-full"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                    />
                    <button onClick={saveTitle} className="p-2 lg:p-3 bg-[#f47b20] text-white rounded-full shrink-0">
                      <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                ) : (
                  <h1
                    onClick={() => setIsEditingTitle(true)}
                    className="text-2xl sm:text-3xl lg:text-5xl font-black text-[#0a1628] tracking-tighter cursor-pointer hover:text-[#f47b20] transition-colors uppercase"
                  >
                    {trip.title}
                  </h1>
                )}
              </div>

              <div className="grid grid-cols-2 lg:flex gap-2 lg:gap-3">
                <button
                  onClick={() => {
                    setModalType("dest")
                    setEditingId(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-[#0a1628] text-white px-3 sm:px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black uppercase text-[9px] lg:text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all"
                >
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4" /> Ciudad
                </button>
                <button
                  onClick={() => {
                    setModalType("transport")
                    setEditingId(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-white text-[#0a1628] px-3 sm:px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black uppercase text-[9px] lg:text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all border border-slate-200"
                >
                  <Plane className="w-3 h-3 lg:w-4 lg:h-4" /> Transporte
                </button>
                <button
                  onClick={() => {
                    setModalType("hotel")
                    setEditingId(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-white text-[#0a1628] px-3 sm:px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black uppercase text-[9px] lg:text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all border border-slate-200"
                >
                  <Hotel className="w-3 h-3 lg:w-4 lg:h-4" /> Hotel
                </button>
                <button
                  onClick={() => {
                    setModalType("expense")
                    setEditingId(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-[#f47b20] text-white px-3 sm:px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black uppercase text-[9px] lg:text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
                >
                  <CreditCard className="w-3 h-3 lg:w-4 lg:h-4" /> Gasto
                </button>
              </div>
            </header>

            {activeTab === "resumen" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <DashboardCard title="Gastos Totales" icon={<DollarSign className="text-[#f47b20]" />}>
                  <div className="py-4 flex flex-col items-center">
                    <span className="text-4xl font-black text-[#0a1628]">${totalSpentUSD.toLocaleString()}</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Total en Dólares</p>
                  </div>
                </DashboardCard>
                <DashboardCard title="Categorías" icon={<CreditCard className="text-[#f47b20]" />}>
                  <ExpenseChart expenses={trip.expenses} />
                </DashboardCard>
                <DashboardCard title="Ruta del Viaje" icon={<MapIcon className="text-[#f47b20]" />}>
                  <div className="h-64 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setActiveTab("mapa")}>
                    <TripMap destinations={trip.destinations} />
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "itinerario" && (
              <div className="max-w-4xl mx-auto space-y-10">
                <h2 className="text-3xl font-black text-[#0a1628] flex items-center gap-3">
                  <ListTodo className="text-[#f47b20]" /> Ciudades y Actividades
                </h2>
                {trip.destinations.length === 0 ? (
                  <p className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest bg-white rounded-3xl border border-dashed">
                    No hay ciudades todavía
                  </p>
                ) : (
                  <div className="space-y-6">
                    {trip.destinations
                      .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime())
                      .map((dest) => (
                        <div
                          key={dest.id}
                          className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 group transition-all hover:border-[#f47b20]/30"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <p className="text-[10px] font-black text-[#f47b20] uppercase mb-1">{dest.country}</p>
                              <h3 className="text-2xl font-black text-[#0a1628]">{dest.city}</h3>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingId(dest.id)
                                  setModalType("dest")
                                  setIsModalOpen(true)
                                }}
                                className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteItem("destinations", dest.id)}
                                className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-4">
                            {dest.arrivalDate} al {dest.departureDate}
                          </p>
                          <div className="bg-slate-50 p-6 rounded-xl text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                            {dest.notes || "Sin actividades registradas."}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "logistica" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-[#0a1628] flex items-center gap-3">
                    <Plane className="text-[#f47b20]" /> Transporte
                  </h2>
                  {trip.transportation.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                          <Plane className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-black text-[#0a1628]">
                            {t.from} → {t.to}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {t.type} • {t.date} • {t.departureTime}
                          </p>
                          {t.cost && t.cost > 0 && (
                            <p className="text-[10px] font-black text-[#f47b20] mt-1">
                              {t.cost.toLocaleString()} {t.currency}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem("transportation", t.id)}
                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setModalType("transport")
                      setEditingId(null)
                      setIsModalOpen(true)
                    }}
                    className="w-full border-2 border-dashed border-slate-200 py-4 rounded-3xl text-slate-400 font-bold text-xs uppercase hover:bg-slate-50"
                  >
                    + Añadir Transporte
                  </button>
                </div>
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-[#0a1628] flex items-center gap-3">
                    <Hotel className="text-[#f47b20]" /> Alojamiento
                  </h2>
                  {trip.accommodations.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center group"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                          <Hotel className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-black text-[#0a1628]">{a.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {a.city} • {a.checkIn} al {a.checkOut}
                          </p>
                          {a.cost && a.cost > 0 && (
                            <p className="text-[10px] font-black text-[#f47b20] mt-1">
                              {a.cost.toLocaleString()} {a.currency}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteItem("accommodations", a.id)}
                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setModalType("hotel")
                      setEditingId(null)
                      setIsModalOpen(true)
                    }}
                    className="w-full border-2 border-dashed border-slate-200 py-4 rounded-3xl text-slate-400 font-bold text-xs uppercase hover:bg-slate-50"
                  >
                    + Añadir Alojamiento
                  </button>
                </div>
              </div>
            )}

            {activeTab === "presupuesto" && (
              <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-[#0a1628] mb-8 flex items-center gap-3">
                  <CreditCard className="text-[#f47b20]" /> Historial de Gastos
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Original
                        </th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                          USD Equiv.
                        </th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {trip.expenses.map((e) => (
                        <tr key={e.id} className="group hover:bg-slate-50/50">
                          <td className="py-4 font-bold text-[#0a1628]">
                            {e.description}{" "}
                            <span className="block text-[9px] font-black text-slate-300 uppercase">{e.category}</span>
                          </td>
                          <td className="py-4 font-black text-slate-500">
                            {e.amount.toLocaleString()} {e.currency}
                          </td>
                          <td className="py-4 text-right font-black text-[#f47b20]">
                            ${(e.amount * (EXCHANGE_RATES[e.currency] || 1)).toLocaleString()}
                          </td>
                          <td className="py-4 text-right">
                            {!e.linkedId && (
                              <button
                                onClick={() => deleteItem("expenses", e.id)}
                                className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {e.linkedId && (
                              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                                Auto-link
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "calendario" && <TripCalendar trip={trip} />}
            {activeTab === "mapa" && (
              <div className="h-[80vh]">
                <TripMap destinations={trip.destinations} />
              </div>
            )}
            {isModalOpen && (
              <div className="fixed inset-0 bg-[#0a1628]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-3xl font-black text-[#0a1628] uppercase">
                      {modalType === "dest"
                        ? "Ciudad"
                        : modalType === "expense"
                          ? "Gasto"
                          : modalType === "transport"
                            ? "Transporte"
                            : "Hotel"}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)}>
                      <X className="w-8 h-8 text-slate-300" />
                    </button>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const f = new FormData(e.currentTarget)
                      if (modalType === "dest")
                        await handleAddOrEditDestination({
                          city: f.get("city") as string,
                          country: f.get("country") as string,
                          arrivalDate: f.get("arrival") as string,
                          departureDate: f.get("departure") as string,
                          notes: f.get("notes") as string | undefined,
                        })
                      if (modalType === "expense")
                        addOrUpdateExpense({
                          description: f.get("desc"),
                          amount: Number(f.get("amt")),
                          currency: f.get("curr"),
                          category: f.get("cat"),
                          date: new Date().toISOString(),
                        })
                      if (modalType === "transport")
                        addOrUpdateTransport({
                          from: f.get("from"),
                          to: f.get("to"),
                          date: f.get("date"),
                          type: f.get("type"),
                          departureTime: f.get("dep"),
                          arrivalTime: f.get("arr"),
                          cost: Number(f.get("cost")),
                          currency: f.get("curr"),
                        })
                      if (modalType === "hotel")
                        addOrUpdateHotel({
                          name: f.get("name"),
                          city: f.get("city"),
                          checkIn: f.get("in"),
                          checkOut: f.get("out"),
                          address: "",
                          cost: Number(f.get("cost")),
                          currency: f.get("curr"),
                        })
                      setIsModalOpen(false)
                      setSelectedCity(null)
                    }}
                    className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
                  >
                    {modalType === "dest" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            name="city"
                            required
                            placeholder="Ciudad"
                            className="bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                            onChange={(e) => {
                              const cityValue = e.target.value
                              const countryValue = (e.target.form?.elements.namedItem("country") as HTMLInputElement)
                                ?.value
                              if (cityValue && countryValue) {
                                setSelectedCity({ city: cityValue, country: countryValue })
                              }
                            }}
                          />
                          <input
                            name="country"
                            required
                            placeholder="País"
                            className="bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                            onChange={(e) => {
                              const countryValue = e.target.value
                              const cityValue = (e.target.form?.elements.namedItem("city") as HTMLInputElement)?.value
                              if (cityValue && countryValue) {
                                setSelectedCity({ city: cityValue, country: countryValue })
                              }
                            }}
                          />
                        </div>
                        {selectedCity && selectedCity.city && selectedCity.country && (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <CityMapPreview city={selectedCity.city} country={selectedCity.country} />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Llegada</label>
                            <input
                              name="arrival"
                              type="date"
                              required
                              className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Salida</label>
                            <input
                              name="departure"
                              type="date"
                              required
                              className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                            />
                          </div>
                        </div>
                        <textarea
                          name="notes"
                          placeholder="¿Qué harás aquí?"
                          className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold h-32 resize-none"
                        />
                      </>
                    )}
                    {modalType === "expense" && (
                      <>
                        <input
                          name="desc"
                          required
                          placeholder="¿En qué gastaste?"
                          className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            name="amt"
                            type="number"
                            step="0.01"
                            required
                            placeholder="Monto"
                            className="bg-slate-50 px-6 py-4 rounded-2xl font-black"
                          />
                          <select name="curr" className="bg-slate-50 px-6 py-4 rounded-2xl font-black">
                            {CURRENCIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.code}
                              </option>
                            ))}
                          </select>
                        </div>
                        <select name="cat" className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-black">
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                    {modalType === "transport" && (
                      <>
                        <select name="type" className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-black">
                          {TRANSPORT_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            name="from"
                            required
                            placeholder="Origen"
                            className="bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                          />
                          <input
                            name="to"
                            required
                            placeholder="Destino"
                            className="bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                          />
                        </div>
                        <input
                          name="date"
                          type="date"
                          required
                          className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input name="dep" type="time" className="bg-slate-50 px-6 py-4 rounded-2xl font-bold" />
                          <input name="arr" type="time" className="bg-slate-50 px-6 py-4 rounded-2xl font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            name="cost"
                            type="number"
                            step="0.01"
                            placeholder="Precio (Opcional)"
                            className="bg-slate-50 px-6 py-4 rounded-2xl font-black"
                          />
                          <select name="curr" className="bg-slate-50 px-6 py-4 rounded-2xl font-black">
                            {CURRENCIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.code}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    {modalType === "hotel" && (
                      <>
                        <input
                          name="name"
                          required
                          placeholder="Nombre del Hotel/Airbnb"
                          className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                        />
                        <input
                          name="city"
                          required
                          placeholder="Ciudad"
                          className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Check-in</label>
                            <input
                              name="in"
                              type="date"
                              required
                              className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Check-out</label>
                            <input
                              name="out"
                              type="date"
                              required
                              className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            name="cost"
                            type="number"
                            step="0.01"
                            placeholder="Precio Total (Opcional)"
                            className="bg-slate-50 px-6 py-4 rounded-2xl font-black"
                          />
                          <select name="curr" className="bg-slate-50 px-6 py-4 rounded-2xl font-black">
                            {CURRENCIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.code}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-[#f47b20] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Confirmar Datos
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default WayloApp
