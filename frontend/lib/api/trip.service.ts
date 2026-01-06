import apiClient from './client';

export interface Trip {
  id: string;
  userId: string;
  title: string;
  budget: number;
  currency: string;
  logo?: string;
  destinations: Destination[];
  expenses: Expense[];
  transportation: Transportation[];
  accommodation: Accommodation[];
  totalExpenses?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  _id: string;
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  notes?: string;
}

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  linkedType?: 'transportation' | 'accommodation';
  linkedId?: string;
  destinationId?: string;
}

export interface Transportation {
  _id: string;
  type: string;
  from: string;
  to: string;
  date: string;
  departureTime?: string;
  arrivalTime?: string;
  cost: number;
  currency: string;
  notes?: string;
  destinationId?: string;
}

export interface Accommodation {
  _id: string;
  name: string;
  city: string;
  checkIn: string;
  checkOut: string;
  cost: number;
  currency: string;
  notes?: string;
  destinationId?: string;
}

export interface CreateTripDTO {
  title: string;
  budget: number;
  currency: string;
  logo?: string;
  destinations?: Partial<Destination>[];
}

export const tripService = {
  getAll: (params?: { page?: number; limit?: number; sortBy?: string; order?: 'asc' | 'desc' }) =>
    apiClient.get<{ success: boolean; data: { trips: Trip[]; total: number; page: number; limit: number } }>(
      '/trips',
      { params }
    ),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: { trip: Trip } }>(`/trips/${id}`),

  create: (data: CreateTripDTO) =>
    apiClient.post<{ success: boolean; data: { trip: Trip } }>('/trips', data),

  update: (id: string, data: Partial<Trip>) =>
    apiClient.put<{ success: boolean; data: { trip: Trip } }>(`/trips/${id}`, data),

  patch: (id: string, data: Partial<Trip>) =>
    apiClient.patch<{ success: boolean; data: { trip: Trip } }>(`/trips/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; data: { message: string } }>(`/trips/${id}`),

  // Destinations
  addDestination: (tripId: string, destination: Partial<Destination>) =>
    apiClient.post<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/destinations`,
      destination
    ),

  updateDestination: (tripId: string, destinationId: string, data: Partial<Destination>) =>
    apiClient.put<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/destinations/${destinationId}`,
      data
    ),

  deleteDestination: (tripId: string, destinationId: string) =>
    apiClient.delete<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/destinations/${destinationId}`
    ),

  // Expenses
  addExpense: (tripId: string, expense: Partial<Expense>) =>
    apiClient.post<{ success: boolean; data: { trip: Trip } }>(`/trips/${tripId}/expenses`, expense),

  updateExpense: (tripId: string, expenseId: string, data: Partial<Expense>) =>
    apiClient.put<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/expenses/${expenseId}`,
      data
    ),

  deleteExpense: (tripId: string, expenseId: string) =>
    apiClient.delete<{ success: boolean; data: { trip: Trip } }>(`/trips/${tripId}/expenses/${expenseId}`),

  // Transportation
  addTransportation: (tripId: string, transportation: Partial<Transportation>) =>
    apiClient.post<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/transportation`,
      transportation
    ),

  updateTransportation: (tripId: string, transportationId: string, data: Partial<Transportation>) =>
    apiClient.put<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/transportation/${transportationId}`,
      data
    ),

  deleteTransportation: (tripId: string, transportationId: string) =>
    apiClient.delete<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/transportation/${transportationId}`
    ),

  // Accommodation
  addAccommodation: (tripId: string, accommodation: Partial<Accommodation>) =>
    apiClient.post<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/accommodation`,
      accommodation
    ),

  updateAccommodation: (tripId: string, accommodationId: string, data: Partial<Accommodation>) =>
    apiClient.put<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/accommodation/${accommodationId}`,
      data
    ),

  deleteAccommodation: (tripId: string, accommodationId: string) =>
    apiClient.delete<{ success: boolean; data: { trip: Trip } }>(
      `/trips/${tripId}/accommodation/${accommodationId}`
    ),
};
