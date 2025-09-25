export interface ISlot {
  slotId: string;
  customerId?: string;
  serviceId?: string;
  customerName?: string;
  serviceName?: string;
  totalPrice?: number;
  address?:string;
  phoneNumber?:string;
  status?:string;
  day: string; 
  startTime: string;
  endTime: string;
  type: string;
  note?: string;
  updatedAt?: string;
  createdAt?: string;
}
