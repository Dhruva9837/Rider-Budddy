'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

// Random 4-digit OTP generator
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

export function useRides() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('rides-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['rides'] });
          queryClient.invalidateQueries({ queryKey: ['passenger_requests'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'passenger_requests'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['passenger_requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const ridesQuery = useQuery({
    queryKey: ['rides'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('rides')
          .select(`
            *,
            created_at,
            driver:profiles(full_name, avatar_url),
            pickup_landmark:landmarks!pickup_landmark_id(name),
            destination_landmark:landmarks!destination_landmark_id(name)
          `)
          .eq('status', 'open')
          .order('departure_time', { ascending: true });
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Failed to fetch rides from supabase', err);
        return [];
      }
    },
  });

  const createRideMutation = useMutation({
    mutationFn: async (rideData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('rides')
        .insert([{ ...rideData, driver_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  });

  const requestRideMutation = useMutation({
    mutationFn: async (rideId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ride_bookings')
        .insert([{ 
          ride_id: rideId, 
          rider_id: user.id,
          confirmation_otp: generateOTP(),
          otp_verified: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const passengerRequestsQuery = useQuery({
    queryKey: ['passenger_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passenger_requests')
        .select(`
          *,
          passenger:profiles!passenger_id(full_name, avatar_url),
          pickup_landmark:landmarks!pickup_landmark_id(name),
          destination_landmark:landmarks!destination_landmark_id(name)
        `)
        .eq('status', 'pending')
        .order('departure_time', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const createPassengerRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('passenger_requests')
        .insert([{ 
          ...requestData, 
          passenger_id: user.id,
          confirmation_otp: generateOTP(),
          otp_verified: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passenger_requests'] });
    },
  });

  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const { data, error } = await supabase
        .from('ride_bookings')
        .update({ booking_status: status })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  });

  const submitRatingMutation = useMutation({
    mutationFn: async ({ rideId, driverId, rating, review }: { rideId: string; driverId: string; rating: number; review: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ratings')
        .insert([{ 
          ride_id: rideId, 
          reviewer_id: user.id,
          reviewed_user_id: driverId,
          rating, 
          review 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const landmarksQuery = useQuery({
    queryKey: ['landmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landmarks')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return {
    rides: ridesQuery.data,
    isLoading: ridesQuery.isLoading,
    error: ridesQuery.error,
    createRide: createRideMutation.mutateAsync,
    isCreating: createRideMutation.isPending,
    requestRide: requestRideMutation.mutateAsync,
    isRequesting: requestRideMutation.isPending,
    passengerRequests: passengerRequestsQuery.data,
    isLoadingPassengerRequests: passengerRequestsQuery.isLoading,
    createPassengerRequest: createPassengerRequestMutation.mutateAsync,
    isCreatingPassengerRequest: createPassengerRequestMutation.isPending,
    updateRequestStatus: updateRequestStatusMutation.mutateAsync,
    submitRating: submitRatingMutation.mutateAsync,
    isSubmittingRating: submitRatingMutation.isPending,
    landmarks: landmarksQuery.data,
    isLoadingLandmarks: landmarksQuery.isLoading,
    // OTP Verification Mutations
    verifyBookingOtp: async (bookingId: string, otp: string) => {
      const { data, error } = await supabase
        .from('ride_bookings')
        .update({ otp_verified: true, booking_status: 'completed' })
        .match({ id: bookingId, confirmation_otp: otp })
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Invalid OTP');
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      return data;
    },
    verifyPassengerRequestOtp: async (requestId: string, otp: string) => {
      const { data, error } = await supabase
        .from('passenger_requests')
        .update({ otp_verified: true, status: 'completed' })
        .match({ id: requestId, confirmation_otp: otp })
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Invalid OTP');
      queryClient.invalidateQueries({ queryKey: ['passenger_requests'] });
      return data;
    },
  };
}

