import React from 'react';
import { Button } from "@/components/lib/ui/button";
import { Input } from "@/components/lib/ui/input";
import { Label } from "@/components/lib/ui/label";
import { Icon } from "@iconify/react";

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
      <div className="bg-white rounded-lg shadow-xl w-[480px] max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:calendar" className="w-5 h-5 text-[#EC5A86]" />
            <h3 className="text-lg font-semibold text-[#111]">
              {modalSlotInfo?.isEdit ? 'Edit Event' : 'Add New Event'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Icon icon="lucide:x" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Event Type */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="lucide:type" className="w-4 h-4 text-gray-500" />
              <Label htmlFor="type" className="text-sm font-medium text-[#111]">
                Event Type
              </Label>
            </div>
            <select
              id="type"
              value={newEventForm.type||modalSlotInfo?.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EC5A86] focus:border-[#EC5A86] text-[#111]"
              disabled={modalSlotInfo?.isEdit}
            >
              <option value="BLOCKED">Blocked Time</option>
              <option value="OVERRIDE">Override Time</option>
              <option value="ORIGINAL_WORKING">Working Time</option>
              <option value="NEW_WORKING" hidden>Working</option>
            </select>
          </div>

          {/* Event Name */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="lucide:edit-3" className="w-4 h-4 text-gray-500" />
              <Label htmlFor="name" className="text-sm font-medium text-[#111]">
                Event Name
              </Label>
            </div>
            <Input
              id="name"
              disabled
              type="text"
              value={newEventForm.type === "BLOCKED" ? "Blocked Time" : newEventForm.type === "OVERRIDE" ? "Override Time" : "Working Time"}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EC5A86] focus:border-[#EC5A86] text-[#111] bg-gray-50"
              placeholder="Enter event name"
            />
          </div>

          {/* Time Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:clock" className="w-4 h-4 text-gray-500" />
                <Label htmlFor="startTime" className="text-sm font-medium text-[#111]">
                  Start Time
                </Label>
              </div>
              <Input
                id="startTime"
                type="datetime-local"
                value={newEventForm.startTime || modalSlotInfo?.start}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EC5A86] focus:border-[#EC5A86] text-[#111]"
              />
            </div>

            {/* End Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:clock" className="w-4 h-4 text-gray-500" />
                <Label htmlFor="endTime" className="text-sm font-medium text-[#111]">
                  End Time
                </Label>
              </div>
              <Input
                id="endTime"
                type="datetime-local"
                value={newEventForm.endTime || modalSlotInfo?.end}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EC5A86] focus:border-[#EC5A86] text-[#111]"
              />
            </div>
          </div>

          {/* Note/Reason */}
          <div>
            <Label htmlFor="note" className="text-sm font-medium text-[#111] mb-2 block">
              Note/Reason <span className="text-gray-400">(optional)</span>
            </Label>
            <textarea
              id="note"
              value={newEventForm.note || modalSlotInfo?.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#EC5A86] focus:border-[#EC5A86] text-[#111] resize-none"
              placeholder="di có việc"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 text-[#111] hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
          >
            <Icon icon="lucide:x" className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white focus:ring-2 focus:ring-[#6366f1]"
            disabled={loading}
          >
            <Icon icon="lucide:check" className="w-4 h-4 mr-2" />
            {loading ? (modalSlotInfo?.isEdit ? 'Updating...' : 'Creating...') : (modalSlotInfo?.isEdit ? 'Update Event' : 'Create Event')}
          </Button>
        </div>
      </div>
    </div>
  );
};
