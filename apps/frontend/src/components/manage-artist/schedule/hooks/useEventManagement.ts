import { useCallback } from 'react';
import dayjs from 'dayjs';
import { artistScheduleService } from '@/services/artist-schedule';
import { getMondayOfWeek, formatDateForAPI } from '../utils/calendarUtils';

interface EventForm {
  type: string;
  name: string;
  note: string;
  startTime: string;
  endTime: string;
}

interface UseEventManagementProps {
  id: string;
  fetchSchedule: (weekStart: string) => void;
  setLoading: (loading: boolean) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  setShowAddEventModal: (show: boolean) => void;
  setNewEventForm: (form: EventForm) => void;
  setSelectedEvent: (event: any) => void;
}

export const useEventManagement = ({
  id,
  fetchSchedule,
  setLoading,
  showSuccess,
  showError,
  setShowAddEventModal,
  setNewEventForm,
  setSelectedEvent
}: UseEventManagementProps) => {

  const handleCreateEvent = useCallback(async (newEventForm: EventForm, modalSlotInfo: any) => {
    const startTime = newEventForm.startTime || modalSlotInfo?.start;
    const endTime = newEventForm.endTime || modalSlotInfo?.end;
    
    try {
      setLoading(true);
      let response;
      
      if (newEventForm.type === 'OVERRIDE') {
        response = await artistScheduleService.addOverrideSlot({
          muaId: id,
          overrideStart: formatDateForAPI(startTime),
          overrideEnd: formatDateForAPI(endTime),
          note: newEventForm.note || newEventForm.name
        });
      } else if (newEventForm.type === 'BLOCKED') {
        response = await artistScheduleService.addBlockedSlot({
          muaId: id,
          blockStart: formatDateForAPI(startTime),
          blockEnd: formatDateForAPI(endTime),
          note: newEventForm.note || newEventForm.name
        });
      }else if (newEventForm.type === 'ORIGINAL_WORKING') {
        response = await artistScheduleService.addWorkingSlot({
          muaId: id,
          weekday: dayjs(startTime).format('ddd').toUpperCase(),
          startTime: dayjs(startTime).format('HH:mm'),
          endTime: dayjs(endTime).format('HH:mm'),
          note: newEventForm.note || newEventForm.name
        });
      }
      
      if (response?.success) {
        showSuccess('Created successfully!');
        setShowAddEventModal(false);
        setNewEventForm({ type: 'BLOCKED', name: '', note: '', startTime: '', endTime: '' });
        fetchSchedule(getMondayOfWeek(dayjs(startTime).toDate()));
      } else {
        showError(response?.message || 'Creation failed');
      }
    } catch (err: any) {
      showError(err.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  }, [id, fetchSchedule, setLoading, showSuccess, showError, setShowAddEventModal, setNewEventForm]);

  const handleDeleteEvent = useCallback(async (selectedEvent: any) => {
    if (!selectedEvent || !selectedEvent.slotData) {
      showError('Event information not found for deletion');
      return;
    }

    try {
      setLoading(true);
      let response;
      const slotId = selectedEvent.slotData.slotId;
      
      if (selectedEvent.type === 'NEW_WORKING' || selectedEvent.type === 'ORIGINAL_WORKING') {
        response = await artistScheduleService.deleteWorkingSlot(id, slotId);
      } else if (selectedEvent.type === 'NEW_OVERRIDE'||selectedEvent.type === 'OVERRIDE') {
        response = await artistScheduleService.deleteOverrideSlot(id, slotId);
      } else if (selectedEvent.type === 'BLOCKED') {
        response = await artistScheduleService.deleteBlockedSlot(id, slotId);
      }
      
      if (response?.success) {
        showSuccess('Deleted successfully!');
        setSelectedEvent(null);
        fetchSchedule(getMondayOfWeek(selectedEvent.slotData.day));
      } else {
        showError(response?.message || 'Deletion failed');
      }
    } catch (err: any) {
      showError(err.message || 'Deletion failed');
    } finally {
      setLoading(false);
    }
  }, [id, fetchSchedule, setLoading, showSuccess, showError, setSelectedEvent]);

  const handleUpdateEvent = useCallback(async (
    newEventForm: EventForm, 
    modalSlotInfo: any, 
    selectedEvent: any
  ) => {
    const startTime = newEventForm.startTime || modalSlotInfo?.start;
    const endTime = newEventForm.endTime || modalSlotInfo?.end;
    
    // Sử dụng originalEvent từ modalSlotInfo nếu selectedEvent bị null
    const eventToUpdate = selectedEvent || modalSlotInfo?.originalEvent;
    
    // Debug logging để tìm hiểu vấn đề
    console.log("=== DEBUG handleUpdateEvent ===");
    console.log("newEventForm:", newEventForm);
    console.log("modalSlotInfo:", modalSlotInfo);
    console.log("selectedEvent (may be null):", selectedEvent);
    console.log("eventToUpdate (fallback):", eventToUpdate);
    console.log("startTime:", startTime);
    console.log("endTime:", endTime);
    
    if (!eventToUpdate) {
      console.error("Both selectedEvent and originalEvent are null/undefined!");
      showError('Selected event is missing. Please try selecting the event again.');
      return;
    }
    
    if (!eventToUpdate.slotData) {
      console.error("eventToUpdate.slotData is null/undefined!");
      showError('Event data is missing. Please try selecting the event again.');
      return;
    }
    
    const slotId = eventToUpdate.slotData.slotId;
    console.log("slotId extracted:", slotId);
    
    if (!slotId) {
      console.error("slotId is null/undefined!");
      showError('Slot ID is required for updating. Event data may be corrupted.');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (newEventForm.type === 'NEW_WORKING' || newEventForm.type === 'ORIGINAL_WORKING') {
        const weekday = dayjs(startTime).format('ddd').toUpperCase();
        response = await artistScheduleService.updateWorkingSlot(id, slotId, {
          weekday,
          startTime: dayjs(startTime).format('HH:mm'),
          endTime: dayjs(endTime).format('HH:mm'),
          note: newEventForm.note || newEventForm.name
        });
      } else if (newEventForm.type === 'NEW_OVERRIDE' || newEventForm.type === 'OVERRIDE') {
        response = await artistScheduleService.updateOverrideSlot(id, slotId, {
          overrideStart: formatDateForAPI(startTime),
          overrideEnd: formatDateForAPI(endTime),
          note: newEventForm.note || newEventForm.name
        });
      } else if (newEventForm.type === 'BLOCKED') {
        response = await artistScheduleService.updateBlockedSlot(id, slotId, {
          blockStart: formatDateForAPI(startTime),
          blockEnd: formatDateForAPI(endTime),
          note: newEventForm.note || newEventForm.name
        });
      }
      
      if (response?.success) {
        showSuccess('Event updated successfully!');
        setShowAddEventModal(false);
        setNewEventForm({ type: 'BLOCKED', name: '', note: '', startTime: '', endTime: '' });
        setSelectedEvent(null);
        fetchSchedule(getMondayOfWeek(eventToUpdate.slotData.day));
      } else {
        showError(response?.message || 'Event update failed');
      }
    } catch (err: any) {
      showError(err.message || 'Event update failed');
    } finally {
      setLoading(false);
    }
  }, [id, fetchSchedule, setLoading, showSuccess, showError, setShowAddEventModal, setNewEventForm, setSelectedEvent]);

  const handleOpenEditEvent = useCallback((selectedEvent: any, setNewEventForm: any, setModalSlotInfo: any, setShowAddEventModal: any) => {
    console.log("=== DEBUG handleOpenEditEvent ===");
    console.log("selectedEvent:", selectedEvent);
    console.log("selectedEvent.slotData:", selectedEvent?.slotData);
    
    if (!selectedEvent) {
      console.error("selectedEvent is null in handleOpenEditEvent!");
      showError('Event information not found for editing');
      return;
    }
    
    if (!selectedEvent.slotData) {
      console.error("selectedEvent.slotData is null in handleOpenEditEvent!");
      showError('Event data is missing. Please try selecting the event again.');
      return;
    }

    // Pre-fill form with current event data
    const formData = {
      type: selectedEvent.type,
      name: selectedEvent.slotData.note || selectedEvent.title,
      note: selectedEvent.slotData.note || '',
      startTime: dayjs(selectedEvent.start).format('YYYY-MM-DDTHH:mm'),
      endTime: dayjs(selectedEvent.end).format('YYYY-MM-DDTHH:mm')
    };
    
    const modalData = {
      start: dayjs(selectedEvent.start).format('YYYY-MM-DDTHH:mm'),
      end: dayjs(selectedEvent.end).format('YYYY-MM-DDTHH:mm'),
      day: dayjs(selectedEvent.start).format('YYYY-MM-DD'),
      isEdit: true,
      // Lưu toàn bộ selectedEvent data để sử dụng khi update
      originalEvent: selectedEvent
    };
    
    console.log("Setting form data:", formData);
    console.log("Setting modal data:", modalData);
    
    setNewEventForm(formData);
    setModalSlotInfo(modalData);
    setShowAddEventModal(true);
  }, [showError]);

  return {
    handleCreateEvent,
    handleDeleteEvent,
    handleUpdateEvent,
    handleOpenEditEvent
  };
};
