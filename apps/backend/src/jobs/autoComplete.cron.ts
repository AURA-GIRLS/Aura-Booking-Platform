import cron from 'node-cron';
import { Booking } from '../models/bookings.models';
import { BOOKING_STATUS } from '../constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Cron job tự động chuyển booking từ CONFIRMED sang COMPLETED
 * sau 24h kể từ thời điểm kết thúc booking
 * Chạy mỗi ngày để kiểm tra vao luc 0h
 */
export function startAutoCompleteCron() {
  cron.schedule('0 0 * * *', async () => {
    try {
      await autoCompleteBookings();
    } catch (error) {
      console.error('❌ Error in auto-complete cron job:', error);
    }
  });

  console.log('✅ Auto-complete cron job started (runs every day)');
}

/**
 * Tự động chuyển booking từ CONFIRMED sang COMPLETED sau 24h kể từ khi kết thúc
 * Tránh trường hợp MUA quên đánh dấu đã hoàn thành
 */
async function autoCompleteBookings() {
  try {
    const now = dayjs().tz('Asia/Ho_Chi_Minh');

    // Tìm các booking CONFIRMED mà có bookingDate và duration
    const bookings = await Booking.find({
      status: BOOKING_STATUS.CONFIRMED,
      bookingDate: { $exists: true },
      duration: { $exists: true }
    })
    .lean();

    let completedCount = 0;

    for (const booking of bookings) {
      try {
        if (!booking.bookingDate || typeof booking.duration !== 'number') {
          continue;
        }

        // Tính thời gian kết thúc booking
        const bookingEnd = dayjs(booking.bookingDate)
          .tz('Asia/Ho_Chi_Minh')
          .add(booking.duration, 'minute');
        
        const hoursSinceEnd = now.diff(bookingEnd, 'hour', true);

        // Nếu đã quá 24h kể từ khi kết thúc, tự động chuyển sang COMPLETED
        if (hoursSinceEnd >= 24) {
          await Booking.findByIdAndUpdate(booking._id, {
            status: BOOKING_STATUS.COMPLETED,
            completedAt: new Date(),
            updatedAt: new Date()
          });

          completedCount++;
          console.log(`✅ Auto-completed booking ${booking._id}`);
        }
      } catch (error) {
        console.error(`❌ Error auto-completing booking ${booking._id}:`, error);
      }
    }

    if (completedCount > 0) {
      console.log(`✅ Auto-completed ${completedCount} bookings`);
    }
  } catch (error) {
    console.error('❌ Error in autoCompleteBookings:', error);
  }
}