import type { IBookingSlot, ISlot } from "types/schedule.interfaces";
import { getMondayOfWeek } from "utils/calendarUtils";
import { computeMUAFinalSlots, getRawWeeklySlots, getFinalSlots } from "./schedule.service";
import { fromUTC } from "utils/timeUtils";
import { SLOT_TYPES, BOOKING_STATUS, BOOKING_TYPES } from "constants/index";
import { Booking } from "models/bookings.models";
import type { CreateBookingDTO, UpdateBookingDTO, BookingResponseDTO } from "types/booking.dtos";
import dayjs from "dayjs";

// Helper function to check if two time slots overlap
function slotsOverlap(slot1: ISlot, slot2: ISlot): boolean {
  if (slot1.day !== slot2.day) return false;
  
  const start1 = dayjs(`${slot1.day} ${slot1.startTime}`, "YYYY-MM-DD HH:mm");
  const end1 = dayjs(`${slot1.day} ${slot1.endTime}`, "YYYY-MM-DD HH:mm");
  const start2 = dayjs(`${slot2.day} ${slot2.startTime}`, "YYYY-MM-DD HH:mm");
  const end2 = dayjs(`${slot2.day} ${slot2.endTime}`, "YYYY-MM-DD HH:mm");
  
  return start1.isBefore(end2) && start2.isBefore(end1);
}

// Function to subtract booked time from working slots
function subtractBookedFromWorking(workingSlot: ISlot, bookingSlot: ISlot): ISlot[] {
  if (!slotsOverlap(workingSlot, bookingSlot)) {
    return [workingSlot];
  }
  
  const workStart = dayjs(`${workingSlot.day} ${workingSlot.startTime}`, "YYYY-MM-DD HH:mm");
  const workEnd = dayjs(`${workingSlot.day} ${workingSlot.endTime}`, "YYYY-MM-DD HH:mm");
  const bookStart = dayjs(`${bookingSlot.day} ${bookingSlot.startTime}`, "YYYY-MM-DD HH:mm");
  const bookEnd = dayjs(`${bookingSlot.day} ${bookingSlot.endTime}`, "YYYY-MM-DD HH:mm");
  
  const result: ISlot[] = [];
  
  // If booking starts after working slot starts, create a slot before booking
  if (bookStart.isAfter(workStart)) {
    result.push({
      ...workingSlot,
      endTime: bookStart.format("HH:mm"),
      slotId: `${workingSlot.slotId}_before_${bookingSlot.slotId}`
    });
  }
  
  // If booking ends before working slot ends, create a slot after booking
  if (bookEnd.isBefore(workEnd)) {
    result.push({
      ...workingSlot,
      startTime: bookEnd.format("HH:mm"),
      slotId: `${workingSlot.slotId}_after_${bookingSlot.slotId}`
    });
  }
  
  return result;
}

// Function to split available slots into duration-based time slots
function splitSlotByDuration(slot: any, durationMinutes: number): IBookingSlot[] {
    const result: IBookingSlot[] = [];
    const slotStart = dayjs(`${slot.day} ${slot.startTime}`, "YYYY-MM-DD HH:mm");
    const slotEnd = dayjs(`${slot.day} ${slot.endTime}`, "YYYY-MM-DD HH:mm");
    
    let currentStart = slotStart;
    
    while (currentStart.add(durationMinutes, 'minute').isSameOrBefore(slotEnd)) {
        const currentEnd = currentStart.add(durationMinutes, 'minute');
        
        result.push({
            serviceId: '', // Will be set later
            day: slot.day,
            startTime: currentStart.format("HH:mm"),
            endTime: currentEnd.format("HH:mm")
        });
        
        currentStart = currentEnd;
    }
    
    return result;
}

export async function getAvailableSlots(muaId: string, serviceId: string, day: string, durationMinutes: number): Promise<IBookingSlot[]> {
    // Get final slots (includes working and booking slots)
    const weekStart = getMondayOfWeek(day,"YYYY-MM-DD"); // Monday of the week
    const finalSlotsData = await getFinalSlots(muaId, weekStart);
    const finalSlots = finalSlotsData.slots;
    
    // Filter working slots for the specific day
    const workingTypes = [SLOT_TYPES.ORIGINAL_WORKING, SLOT_TYPES.OVERRIDE, SLOT_TYPES.NEW_WORKING, SLOT_TYPES.NEW_OVERRIDE];
    const workingsOfDay = finalSlots.filter(slot => 
        slot.day === fromUTC(day).format("YYYY-MM-DD") && 
        workingTypes.includes(slot.type as any)
    );
    
    // Filter booking slots for the specific day
    const bookingsOfDay = finalSlots.filter(slot => 
        slot.day === fromUTC(day).format("YYYY-MM-DD") && 
        slot.type === SLOT_TYPES.BOOKING
    );
    
    // Calculate available slots by removing booked time from working slots
    let availableSlots: ISlot[] = [...workingsOfDay];
    
    for (const booking of bookingsOfDay) {
        const newAvailableSlots: ISlot[] = [];
        
        for (const workingSlot of availableSlots) {
            const remainingSlots = subtractBookedFromWorking(workingSlot, booking);
            newAvailableSlots.push(...remainingSlots);
        }
        
        availableSlots = newAvailableSlots;
    }
    
    // Filter out slots with invalid time ranges (startTime >= endTime)
    const validAvailableSlots = availableSlots.filter(slot => {
        const start = dayjs(`${slot.day} ${slot.startTime}`, "YYYY-MM-DD HH:mm");
        const end = dayjs(`${slot.day} ${slot.endTime}`, "YYYY-MM-DD HH:mm");
        return start.isBefore(end);
    });
    
    // Split each available slot into duration-based time slots
    const durationBasedSlots: IBookingSlot[] = [];
    
    for (const slot of validAvailableSlots) {
        const splitSlots = splitSlotByDuration(slot, durationMinutes);
        durationBasedSlots.push(...splitSlots);
    }
    
    // Set serviceId for all slots and return
    return durationBasedSlots.map(slot => ({
        ...slot,
        serviceId
    }));
}

// ==================== OVERLAP CHECKING FUNCTIONS ====================

// Helper function to check if two bookings overlap
function checkBookingOverlap(
    booking1Start: Date,
    booking1End: Date,
    booking2Start: Date,
    booking2End: Date
): boolean {
    return booking1Start < booking2End && booking2Start < booking1End;
}

// Check if a new booking overlaps with existing bookings for the same MUA
async function checkBookingConflict(
    muaId: string,
    bookingDate: Date,
    duration: number,
    excludeBookingId?: string
): Promise<{ hasConflict: boolean; conflictingBooking?: any }> {
    try {
        const bookingStart = dayjs(bookingDate);
        const bookingEnd = bookingStart.add(duration, 'minute');
        
        // Get the start and end of the booking day
        const dayStart = bookingStart.startOf('day').toDate();
        const dayEnd = bookingStart.endOf('day').toDate();

        // Find existing bookings for the same MUA on the same day
        const filter: any = {
            muaId,
            bookingDate: {
                $gte: dayStart,
                $lte: dayEnd
            },
            status: { $nin: [BOOKING_STATUS.CANCELLED] } // Exclude cancelled bookings
        };

        // Exclude current booking if updating
        if (excludeBookingId) {
            filter._id = { $ne: excludeBookingId };
        }

        const existingBookings = await Booking.find(filter).exec();

        // Check for overlaps
        for (const existingBooking of existingBookings) {
            const existingStart = dayjs(existingBooking.bookingDate);
            const existingEnd = existingStart.add(existingBooking.duration || 0, 'minute');

            if (checkBookingOverlap(
                bookingStart.toDate(),
                bookingEnd.toDate(),
                existingStart.toDate(),
                existingEnd.toDate()
            )) {
                return {
                    hasConflict: true,
                    conflictingBooking: {
                        id: existingBooking._id,
                        startTime: existingStart.format('HH:mm'),
                        endTime: existingEnd.format('HH:mm'),
                        date: existingStart.format('YYYY-MM-DD')
                    }
                };
            }
        }

        return { hasConflict: false };
    } catch (error) {
        throw new Error(`Failed to check booking conflict: ${error}`);
    }
}

// ==================== CRUD FUNCTIONS ====================

// CREATE - Tạo booking mới
export async function createBooking(bookingData: CreateBookingDTO): Promise<BookingResponseDTO> {
    try {
        // Check for booking conflicts before creating
        const conflictCheck = await checkBookingConflict(
            bookingData.muaId,
            bookingData.bookingDate,
            bookingData.duration
        );

        if (conflictCheck.hasConflict) {
            throw new Error(
                `Booking conflict detected. There is already a booking from ${conflictCheck.conflictingBooking?.startTime} to ${conflictCheck.conflictingBooking?.endTime} on ${conflictCheck.conflictingBooking?.date}`
            );
        }

        const booking = new Booking({
            ...bookingData,
            status: BOOKING_STATUS.PENDING,
            createdAt: new Date()
        });

        const savedBooking = await booking.save();
        
        // Populate để lấy thông tin customer và service
        const populatedBooking = await Booking.findById(savedBooking._id)
            .populate("customerId serviceId")
            .exec();

        if (!populatedBooking) {
            throw new Error("Failed to retrieve created booking");
        }

        return formatBookingResponse(populatedBooking);
    } catch (error) {
        throw new Error(`Failed to create booking: ${error}`);
    }
}

// READ - Lấy booking theo ID
export async function getBookingById(bookingId: string): Promise<BookingResponseDTO | null> {
    try {
        const booking = await Booking.findById(bookingId)
            .populate("customerId serviceId")
            .exec();

        if (!booking) {
            return null;
        }

        return formatBookingResponse(booking);
    } catch (error) {
        throw new Error(`Failed to get booking: ${error}`);
    }
}

// READ - Lấy tất cả bookings với phân trang
export async function getAllBookings(
    page: number = 1, 
    pageSize: number = 10,
    status?: string
): Promise<{ bookings: BookingResponseDTO[], total: number, page: number, totalPages: number }> {
    try {
        const skip = (page - 1) * pageSize;
        const filter: any = {};
        
        if (status) {
            filter.status = status;
        }

        const [bookings, total] = await Promise.all([
            Booking.find(filter)
                .populate("customerId serviceId")
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 })
                .exec(),
            Booking.countDocuments(filter)
        ]);

        const formattedBookings = bookings.map(booking => formatBookingResponse(booking));

        return {
            bookings: formattedBookings,
            total,
            page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (error) {
        throw new Error(`Failed to get bookings: ${error}`);
    }
}

// READ - Lấy bookings theo customer ID
export async function getBookingsByCustomer(
    customerId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<{ bookings: BookingResponseDTO[], total: number, page: number, totalPages: number }> {
    try {
        const skip = (page - 1) * pageSize;

        const [bookings, total] = await Promise.all([
            Booking.find({ customerId })
                .populate("customerId serviceId")
                .skip(skip)
                .limit(pageSize)
                .sort({ bookingDate: -1 })
                .exec(),
            Booking.countDocuments({ customerId })
        ]);

        const formattedBookings = bookings.map(booking => formatBookingResponse(booking));

        return {
            bookings: formattedBookings,
            total,
            page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (error) {
        throw new Error(`Failed to get customer bookings: ${error}`);
    }
}

// READ - Lấy bookings theo MUA ID
export async function getBookingsByMUA(
    muaId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<{ bookings: BookingResponseDTO[], total: number, page: number, totalPages: number }> {
    try {
        const skip = (page - 1) * pageSize;

        const [bookings, total] = await Promise.all([
            Booking.find({ muaId })
                .populate("customerId serviceId")
                .skip(skip)
                .limit(pageSize)
                .sort({ bookingDate: -1 })
                .exec(),
            Booking.countDocuments({ muaId })
        ]);

        const formattedBookings = bookings.map(booking => formatBookingResponse(booking));

        return {
            bookings: formattedBookings,
            total,
            page,
            totalPages: Math.ceil(total / pageSize)
        };
    } catch (error) {
        throw new Error(`Failed to get MUA bookings: ${error}`);
    }
}

// READ - Lấy bookings theo ngày
export async function getBookingsByDate(
    date: string,
    muaId?: string
): Promise<BookingResponseDTO[]> {
    try {
        const startOfDay = dayjs(date).startOf('day').toDate();
        const endOfDay = dayjs(date).endOf('day').toDate();

        const filter: any = {
            bookingDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };

        if (muaId) {
            filter.muaId = muaId;
        }

        const bookings = await Booking.find(filter)
            .populate("customerId serviceId")
            .sort({ bookingDate: 1 })
            .exec();

        return bookings.map(booking => formatBookingResponse(booking));
    } catch (error) {
        throw new Error(`Failed to get bookings by date: ${error}`);
    }
}

// UPDATE - Cập nhật booking
export async function updateBooking(
    bookingId: string, 
    updateData: UpdateBookingDTO
): Promise<BookingResponseDTO | null> {
    try {
        // Get current booking to check if time/date is being updated
        const currentBooking = await Booking.findById(bookingId).exec();
        if (!currentBooking) {
            return null;
        }

        // Check for conflicts if booking date, duration, or muaId is being updated
        if (updateData.bookingDate || updateData.duration || updateData.muaId) {
            const newMuaId = updateData.muaId || currentBooking.muaId;
            const newBookingDate = updateData.bookingDate || currentBooking.bookingDate;
            const newDuration = updateData.duration || currentBooking.duration || 0;

            const conflictCheck = await checkBookingConflict(
                newMuaId,
                newBookingDate,
                newDuration,
                bookingId // Exclude current booking from conflict check
            );

            if (conflictCheck.hasConflict) {
                throw new Error(
                    `Booking conflict detected. There is already a booking from ${conflictCheck.conflictingBooking?.startTime} to ${conflictCheck.conflictingBooking?.endTime} on ${conflictCheck.conflictingBooking?.date}`
                );
            }
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate("customerId serviceId").exec();

        if (!updatedBooking) {
            return null;
        }

        return formatBookingResponse(updatedBooking);
    } catch (error) {
        throw new Error(`Failed to update booking: ${error}`);
    }
}

// UPDATE - Cập nhật status booking
export async function updateBookingStatus(
    bookingId: string, 
    status: string
): Promise<BookingResponseDTO | null> {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate("customerId serviceId").exec();

        if (!updatedBooking) {
            return null;
        }

        return formatBookingResponse(updatedBooking);
    } catch (error) {
        throw new Error(`Failed to update booking status: ${error}`);
    }
}

// DELETE - Xóa booking (soft delete bằng cách đổi status thành CANCELLED)
export async function cancelBooking(bookingId: string): Promise<BookingResponseDTO | null> {
    try {
        const cancelledBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { 
                status: BOOKING_STATUS.CANCELLED,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate("customerId serviceId").exec();

        if (!cancelledBooking) {
            return null;
        }

        return formatBookingResponse(cancelledBooking);
    } catch (error) {
        throw new Error(`Failed to cancel booking: ${error}`);
    }
}

// DELETE - Xóa booking hoàn toàn (hard delete)
export async function deleteBooking(bookingId: string): Promise<boolean> {
    try {
        const result = await Booking.findByIdAndDelete(bookingId).exec();
        return result !== null;
    } catch (error) {
        throw new Error(`Failed to delete booking: ${error}`);
    }
}

// UTILITY - Format booking response
function formatBookingResponse(booking: any): BookingResponseDTO {
    return {
        _id: booking._id.toString(),
        customerId: (booking.customerId as any)?._id?.toString() || '',
        artistId: booking.muaId?._id?.toString() || '',
        serviceId: (booking.serviceId as any)?._id?.toString() || '',
        customerName: (booking.customerId as any)?.fullName ?? "",
        serviceName: (booking.serviceId as any)?.name ?? "",
        bookingDate: fromUTC(booking.bookingDate!).format("YYYY-MM-DD"),
        startTime: fromUTC(booking.bookingDate!).format("HH:mm"),
        endTime: fromUTC(booking.bookingDate!).add(booking.duration!, 'minute').format("HH:mm"),
        duration: booking.duration || 0,
        locationType: booking.locationType || BOOKING_TYPES.ONLINE,
        address: booking.address || '',
        status: booking.status || BOOKING_STATUS.PENDING,
        travelFee: booking.travelFee,
        totalPrice: booking.totalPrice || 0,
        note: booking.note,
        createdAt: booking.createdAt || new Date(),
        updatedAt: booking.updatedAt || booking.createdAt || new Date()
    };
}