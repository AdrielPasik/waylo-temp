export interface TripDestination {
  id: string
  city: string
  country: string
  arrivalDate: string
  departureDate: string
  notes?: string
  lat?: number
  lng?: number
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  category: string
  date: string
  linkedId?: string
}

export interface Transportation {
  id: string
  type: string
  from: string
  to: string
  date: string
  departureTime?: string
  arrivalTime?: string
  cost?: number
  currency: string
}

export interface Accommodation {
  id: string
  name: string
  city: string
  checkIn: string
  checkOut: string
  address: string
  cost?: number
  currency: string
}

export interface TripData {
  title: string
  budget: number
  logo?: string
  destinations: TripDestination[]
  expenses: Expense[]
  transportation: Transportation[]
  accommodations: Accommodation[]
}

export type ActiveTab = "resumen" | "itinerario" | "logistica" | "calendario" | "mapa" | "presupuesto"
