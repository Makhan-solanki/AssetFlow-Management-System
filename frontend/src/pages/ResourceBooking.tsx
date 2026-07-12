import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarRange, ShieldAlert, Clock, User, CheckCircle2 } from 'lucide-react';

interface BookableAsset {
  id: string;
  name: string;
  assetTag: string;
  location: string;
}

interface Booking {
  id: string;
  assetId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  asset: { name: string; assetTag: string };
  user: { name: string; email: string };
}

export const ResourceBooking: React.FC = () => {
  const [bookableAssets, setBookableAssets] = useState<BookableAsset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedAssetDate, setSelectedAssetDate] = useState('2026-07-12'); // Defaults to today
  
  // Slot Booking Form
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  const [overlapError, setOverlapError] = useState<{
    overlap: boolean;
    message: string;
    conflictingBooking?: {
      user: { name: string };
      startTime: string;
      endTime: string;
    };
  } | null>(null);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const assetsRes = await api.get('/assets', { params: { isBookable: 'true' } });
      setBookableAssets(assetsRes.data.data);
      if (assetsRes.data.data.length > 0 && !selectedAssetId) {
        setSelectedAssetId(assetsRes.data.data[0].id);
      }

      const bookingsRes = await api.get('/bookings');
      setBookings(bookingsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setOverlapError(null);
    try {
      // Combine date and time
      const startDateTime = `${selectedAssetDate}T${startTime}:00`;
      const endDateTime = `${selectedAssetDate}T${endTime}:00`;

      await api.post('/bookings', {
        assetId: selectedAssetId,
        startTime: startDateTime,
        endTime: endDateTime,
        notes,
      });
      setMessage('Booking confirmed successfully!');
      setStartTime('');
      setEndTime('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.overlap) {
        setOverlapError({
          overlap: true,
          message: err.response.data.message,
          conflictingBooking: err.response.data.conflictingBooking,
        });
      } else {
        setMessage(err.response?.data?.message || 'Booking failed.');
      }
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      setMessage('Booking cancelled successfully.');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  // Get current selected asset detail
  const currentAsset = bookableAssets.find(a => a.id === selectedAssetId);

  // Filter bookings for selected asset on selected date
  const filteredBookings = bookings.filter(b => {
    if (b.assetId !== selectedAssetId || b.status === 'CANCELLED') return false;
    const bookingDate = new Date(b.startTime).toISOString().split('T')[0];
    return bookingDate === selectedAssetDate;
  });

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Resource Booking</h1>
        <p className="text-sm text-slate-400 mt-1">Book shared facilities and view timeslot availability timelines.</p>
      </div>

      {message && (
        <div className="bg-brand-900/20 border border-brand-500/30 text-brand-300 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold hover:text-white">&times;</button>
        </div>
      )}

      {/* Resource selector bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-xs">
        <div className="w-full sm:w-1/2">
          <label className="block text-slate-400 font-semibold mb-1">Select Shared Resource</label>
          <select
            value={selectedAssetId}
            onChange={(e) => {
              setSelectedAssetId(e.target.value);
              setOverlapError(null);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
          >
            {bookableAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.assetTag}) — {asset.location}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/2">
          <label className="block text-slate-400 font-semibold mb-1">Booking Date</label>
          <input
            type="date"
            value={selectedAssetDate}
            onChange={(e) => setSelectedAssetDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Availability Timeline - Screen 6 style */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Availability Schedule: {currentAsset?.name || 'Resource'} ({selectedAssetDate})
          </h3>

          <div className="relative pl-12 border-l border-slate-800 space-y-8 py-2 text-xs">
            {/* Timeline hour marks */}
            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => {
              // Check if there is an active booking during this slot hour
              const activeBookingInSlot = filteredBookings.find((b) => {
                const bStartHour = new Date(b.startTime).toTimeString().substring(0, 5);
                const bEndHour = new Date(b.endTime).toTimeString().substring(0, 5);
                return time >= bStartHour && time < bEndHour;
              });

              return (
                <div key={time} className="relative">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[53px] top-1 text-slate-500 font-semibold font-mono w-10 text-right">{time}</div>
                  <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-900" />
                  
                  {activeBookingInSlot ? (
                    <div className="bg-brand/10 border-l-4 border-brand text-brand-300 p-4 rounded-xl shadow-sm">
                      <span className="font-bold text-white block">Booked - {activeBookingInSlot.user?.name || 'Team'}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Slot: {new Date(activeBookingInSlot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(activeBookingInSlot.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic py-2">Slot available</div>
                  )}
                </div>
              );
            })}

            {/* Dotted/Dashed Conflict Overlay from Screen 6 when overlap state is present */}
            {overlapError && (
              <div className="bg-red-950/20 border-2 border-dashed border-red-800 text-red-300 p-4 rounded-xl shadow-lg relative">
                <span className="font-bold block">Conflict - Slot is unavailable</span>
                <span className="text-[10px] text-red-400/80 mt-1 block">{overlapError.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking slot Form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 h-fit">
          <h3 className="text-md font-bold text-white flex items-center space-x-2">
            <CalendarRange className="w-4 h-4 text-brand" />
            <span>Book a slot</span>
          </h3>
          
          <form onSubmit={handleBook} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Start Time *</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">End Time *</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Purpose / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Brief reason for reserve slot..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl transition-all"
            >
              Reserve Slot
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
