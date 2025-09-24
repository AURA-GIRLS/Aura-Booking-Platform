import type { BookingResponseDTO } from '@/types/booking.dtos';


interface RecentBookingsProps {
  recentBookings: BookingResponseDTO[];
  recentFilter: 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  setRecentFilter: (filter: 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => void;
  getStatusColor: (status: string) => string;
  formatCurrency: (amount: number) => string;
}

export default function RecentBookings({ 
  recentBookings, 
  recentFilter, 
  setRecentFilter, 
  getStatusColor, 
  formatCurrency 
}: RecentBookingsProps) {
  const filteredRecent = recentFilter === 'ALL' ? recentBookings : recentBookings.filter(b => b.status === recentFilter);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
        <div className="flex gap-2 text-xs">
          {['ALL','PENDING','CONFIRMED','CANCELLED','COMPLETED'].map(tab => (
            <button
              key={tab}
              onClick={() => setRecentFilter(tab as any)}
              className={`px-3 py-1 rounded-full transition-colors ${
                recentFilter === tab
                  ? 'bg-pink-100 text-pink-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
         </div>
      </div>

      <div className="space-y-3">
        {filteredRecent.map(booking => (
           <div key={booking._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
             <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${
                 booking.status === 'CONFIRMED' ? 'bg-green-500' :
                 booking.status === 'PENDING' ? 'bg-orange-500' :
                 booking.status === 'COMPLETED' ? 'bg-gray-900' :
                 'bg-red-500'
               }`}></div>
               <div>
                 <h4 className="font-semibold text-gray-900">{booking.customerName}</h4>
                 <p className="text-sm text-gray-600">{booking.serviceName}</p>
                 <p className="text-xs text-gray-500">{booking.bookingDate} • {booking.startTime}</p>
               </div>
             </div>
             <div className="text-right">
               <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                 {booking.status}
               </div>
               <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(booking.totalPrice)}</p>
             </div>
           </div>
         ))}
         {filteredRecent.length === 0 && (
           <div className="text-center py-8 text-gray-500">
             No recent bookings found.
           </div>
         )}
      </div>
    </div>
  );
}
