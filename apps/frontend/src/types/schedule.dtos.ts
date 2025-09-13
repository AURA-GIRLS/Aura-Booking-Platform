export interface ISlot {
  slotId: string;
  customerId?: string;
  serviceId?: string;
  day: string; 
  startTime: string;
  endTime: string;
  type: string;
  note?: string;
}