import React from 'react';
import { Button } from "@/components/lib/ui/button";
import { Input } from "@/components/lib/ui/input";
import { Label } from "@/components/lib/ui/label";

interface EventForm {
  type: string;
  name: string;
  note: string;
  startTime: string;
  endTime: string;
}

interface EventModalProps {
  showAddEventModal: boolean;
  modalSlotInfo: any;
  newEventForm: EventForm;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (form: EventForm) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  showAddEventModal,
  modalSlotInfo,
  newEventForm,
  loading,
  onClose,
  onSubmit,
  onFormChange
}) => {
  if (!showAddEventModal) return null;

  const handleInputChange = (field: keyof EventForm, value: string) => {
    onFormChange({
      ...newEventForm,
      [field]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {modalSlotInfo?.isEdit ? 'Edit Event' : 'Add New Event'}
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="type" className="block text-sm font-medium mb-1">
              Event Type
            </Label>
            <select
              id="type"
              value={newEventForm.type||modalSlotInfo?.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={modalSlotInfo?.isEdit}
            >
              <option value="BLOCKED">Blocked</option>
              <option value="OVERRIDE">Override</option>
              <option value="ORIGINAL_WORKING">Working</option>
              <option value="NEW_WORKING" hidden>Working</option>
            </select>
          </div>
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-1">
              Event Name
            </Label>
            <Input
              id="name"
              disabled
              type="text"
              value={newEventForm.type === "BLOCKED" ? "Blocked" : newEventForm.type === "OVERRIDE" ? "Override" : "Working"}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full"
              placeholder="Enter event name"
            />
          </div>
          <div>
            <Label htmlFor="startTime" className="block text-sm font-medium mb-1">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={newEventForm.startTime || modalSlotInfo?.start}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="block text-sm font-medium mb-1">
              End Time
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={newEventForm.endTime || modalSlotInfo?.end}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="note" className="block text-sm font-medium mb-1">
              Note/Reason (optional)
            </Label>
            <textarea
              id="note"
              value={newEventForm.note || modalSlotInfo?.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Add a note or reason for this event"
              rows={3}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
            disabled={loading}
          >
            {loading ? (modalSlotInfo?.isEdit ? 'Updating...' : 'Creating...') : (modalSlotInfo?.isEdit ? 'Update Event' : 'Create Event')}
          </Button>
        </div>
      </div>
    </div>
  );
};
