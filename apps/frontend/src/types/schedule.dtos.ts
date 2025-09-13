export interface ISlot {
  slotId: string;
  customerId?: string;
  serviceId?: string;
  customerName?: string;
  serviceName?: string;
  status?:string;
  day: string; 
  startTime: string;
  endTime: string;
  type: string;
  note?: string;
}