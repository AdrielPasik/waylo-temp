'use client';

import { useEffect, useState } from 'react';
import { tripService, Trip, CreateTripDTO } from '@/lib/api/trip.service';

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await tripService.getAll();
      setTrips(data.data.trips);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: CreateTripDTO) => {
    try {
      const { data } = await tripService.create(tripData);
      setTrips([...trips, data.data.trip]);
      return data.data.trip;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to create trip');
    }
  };

  const updateTrip = async (id: string, tripData: Partial<Trip>) => {
    try {
      const { data } = await tripService.update(id, tripData);
      setTrips(trips.map((t) => (t.id === id ? data.data.trip : t)));
      return data.data.trip;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to update trip');
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      await tripService.delete(id);
      setTrips(trips.filter((t) => t.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to delete trip');
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    loading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  };
};
