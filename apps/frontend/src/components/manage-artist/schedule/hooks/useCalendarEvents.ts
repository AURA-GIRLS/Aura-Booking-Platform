import { useCallback } from 'react';
import dayjs from 'dayjs';
import { artistScheduleService } from '@/services/artist-schedule';
import { getMondayOfWeek, formatDateForAPI, formatTimeForAPI, getWeekdayName } from '../utils/calendarUtils';

interface UseCalendarEventsProps {
  id: string;
  fetchSchedule: (weekStart: string) => void;
  setLoading: (loading: boolean) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

export const useCalendarEvents = ({
  id,
  fetchSchedule,
  setLoading,
  showSuccess,
  showError
}: UseCalendarEventsProps) => {
  
  const handleEventDrop = useCallback(async (args: any) => {
    const { event, start, end } = args;
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    console.log("Event dropped:", event.id, startDate, endDate);
    
    if (event.type === 'BOOKING') {
      showError('Cannot move booking');
      return;
    }
    
    try {
      setLoading(true);
      let response;
      
      if (event.type === 'NEW_WORKING' || event.type === 'ORIGINAL_WORKING') {
        const weekday = getWeekdayName(startDate);
        response = await artistScheduleService.updateWorkingSlot(id, event.id, {
          weekday,
          startTime: formatTimeForAPI(startDate),
          endTime: formatTimeForAPI(endDate)
        });
      } else if (event.type === 'OVERRIDE') {
        response = await artistScheduleService.updateOverrideSlot(id, event.id, {
          overrideStart: formatDateForAPI(startDate),
          overrideEnd: formatDateForAPI(endDate)
        });
      } else if (event.type === 'BLOCKED') {
        response = await artistScheduleService.updateBlockedSlot(id, event.id, {
          blockStart: formatDateForAPI(startDate),
          blockEnd: formatDateForAPI(endDate)
        });
      }
      
      if (response?.success) {
        showSuccess('Updated successfully!');
        fetchSchedule(getMondayOfWeek(dayjs(startDate).toDate()));
      } else {
        showError(response?.message || 'Update failed');
      }
    } catch (err: any) {
      showError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }, [id, fetchSchedule, setLoading, showSuccess, showError]);

  const handleEventResize = useCallback(async (args: any) => {
    const { event, start, end } = args;
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    console.log("Event resized:", event.id, startDate, endDate);
    
    if (event.type === 'BOOKING') {
      showError('Cannot resize booking');
      return;
    }
    
    try {
      setLoading(true);
      let response;
      
      if (event.type === 'NEW_WORKING' || event.type === 'ORIGINAL_WORKING') {
        const weekday = getWeekdayName(startDate);
        response = await artistScheduleService.updateWorkingSlot(id, event.id, {
          weekday,
          startTime: formatTimeForAPI(startDate),
          endTime: formatTimeForAPI(endDate)
        });
      } else if (event.type === 'OVERRIDE') {
        response = await artistScheduleService.updateOverrideSlot(id, event.id, {
          overrideStart: formatDateForAPI(startDate),
          overrideEnd: formatDateForAPI(endDate)
        });
      } else if (event.type === 'BLOCKED') {
        response = await artistScheduleService.updateBlockedSlot(id, event.id, {
          blockStart: formatDateForAPI(startDate),
          blockEnd: formatDateForAPI(endDate)
        });
      }
      
      if (response?.success) {
        showSuccess('Updated successfully!');
        fetchSchedule(getMondayOfWeek(dayjs(startDate).toDate()));
      } else {
        showError(response?.message || 'Update failed');
      }
    } catch (err: any) {
      showError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }, [id, fetchSchedule, setLoading, showSuccess, showError]);

  return {
    handleEventDrop,
    handleEventResize
  };
};
