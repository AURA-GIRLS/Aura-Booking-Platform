import cron from 'node-cron';
import { Booking } from '../models/bookings.models';
import { ReminderEmailService } from '../services/reminder.email.service';
import { BOOKING_STATUS } from '../constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const reminderService = new ReminderEmailService();

// Cron job chạy mỗi 5 phút để kiểm tra và gửi email nhắc nhở
export function startReminderCron() {
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Running booking reminder cron job...');
    
    try {
      await send24hReminders();
      await send1hReminders();
    } catch (error) {
      console.error('❌ Error in reminder cron job:', error);
    }
  });

  console.log('✅ Reminder cron job started (runs every 5 minutes)');
}

// Gửi nhắc nhở 24h trước (chỉ gửi 1 lần)
async function send24hReminders() {
  try {
    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    // Tìm booking từ 6h đến 24h (khoảng "khoảng 1 ngày")
    const from6h = now.add(6, 'hour').toDate();
    const to24h = now.add(24, 'hour').toDate();

    // Tìm các booking CONFIRMED, CHƯA gửi email 24h, và sắp đến trong 6-24h
    const bookings = await Booking.find({
      status: BOOKING_STATUS.CONFIRMED,
      reminded24h: { $ne: true }, // Chưa gửi email 24h
      bookingDate: {
        $gte: from6h,
        $lte: to24h
      }
    })
    .populate('customerId', 'email fullName')
    .populate('serviceId', 'name')
    .populate('muaId')
    .lean();

    console.log(`📧 Found ${bookings.length} bookings for 24h reminder (6-24h range)`);

    for (const booking of bookings) {
      try {
        const customer: any = booking.customerId;
        const service: any = booking.serviceId;
        const mua: any = booking.muaId;

        // Tính thời gian còn lại
        const bookingTime = dayjs(booking.bookingDate).tz('Asia/Ho_Chi_Minh');
        const hoursLeft = bookingTime.diff(now, 'hour', true);
        console.log(`⏰ [24h] Booking ${booking._id} at ${bookingTime.format('YYYY-MM-DD HH:mm')} (${hoursLeft.toFixed(1)}h left)`);

        if (!customer?.email || !booking.bookingDate || !booking.address) {
          console.warn(`⚠️ Booking ${booking._id} missing required data`);
          continue;
        }

        // Lấy tên MUA
        let muaName = 'Makeup Artist';
        if (mua?.userId) {
          const User = require('../models/users.models').User;
          const muaUser = await User.findById(mua.userId).select('fullName').lean();
          muaName = muaUser?.fullName || muaName;
        }

        await reminderService.send24hReminder({
          to: customer.email,
          customerName: customer.fullName,
          muaName,
          serviceName: service?.name,
          bookingDate: booking.bookingDate,
          address: booking.address
        });

        // Đánh dấu đã gửi email 24h
        await Booking.findByIdAndUpdate(booking._id, {
          reminded24h: true,
          lastReminderAt: new Date()
        });

        console.log(`✅ Sent 24h reminder for booking ${booking._id}`);
      } catch (error) {
        console.error(`❌ Error sending 24h reminder for booking ${booking._id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error in send24hReminders:', error);
  }
}

// Gửi nhắc nhở 1h trước (chỉ gửi 1 lần)
async function send1hReminders() {
  try {
    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    // Tìm booking từ 30 phút đến 1.5 giờ (khoảng "khoảng 1 giờ")
    const from30min = now.add(30, 'minute').toDate();
    const to1h30 = now.add(1.5, 'hour').toDate();

    // Tìm các booking CONFIRMED, CHƯA gửi email 1h, và sắp đến trong 30min-1.5h
    const bookings = await Booking.find({
      status: BOOKING_STATUS.CONFIRMED,
      reminded1h: { $ne: true }, // Chưa gửi email 1h
      bookingDate: {
        $gte: from30min,
        $lte: to1h30
      }
    })
    .populate('customerId', 'email fullName')
    .populate('serviceId', 'name')
    .populate('muaId')
    .lean();

    console.log(`📧 Found ${bookings.length} bookings for 1h reminder (30min-1.5h range)`);

    for (const booking of bookings) {
      try {
        const customer: any = booking.customerId;
        const service: any = booking.serviceId;
        const mua: any = booking.muaId;

        // Tính thời gian còn lại
        const bookingTime = dayjs(booking.bookingDate).tz('Asia/Ho_Chi_Minh');
        const minutesLeft = bookingTime.diff(now, 'minute', true);
        console.log(`⏰ [1h] Booking ${booking._id} at ${bookingTime.format('YYYY-MM-DD HH:mm')} (${minutesLeft.toFixed(0)}min left)`);

        if (!customer?.email || !booking.bookingDate || !booking.address) {
          console.warn(`⚠️ Booking ${booking._id} missing required data`);
          continue;
        }

        // Lấy tên MUA
        let muaName = 'Makeup Artist';
        if (mua?.userId) {
          const User = require('../models/users.models').User;
          const muaUser = await User.findById(mua.userId).select('fullName').lean();
          muaName = muaUser?.fullName || muaName;
        }

        await reminderService.send1hReminder({
          to: customer.email,
          customerName: customer.fullName,
          muaName,
          serviceName: service?.name,
          bookingDate: booking.bookingDate,
          address: booking.address
        });

        // Đánh dấu đã gửi email 1h
        await Booking.findByIdAndUpdate(booking._id, {
          reminded1h: true,
          lastReminderAt: new Date()
        });

        console.log(`✅ Sent 1h reminder for booking ${booking._id}`);
      } catch (error) {
        console.error(`❌ Error sending 1h reminder for booking ${booking._id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error in send1hReminders:', error);
  }
}