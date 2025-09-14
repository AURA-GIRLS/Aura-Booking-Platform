export interface ISlot {
  slotId: string;
  customerId?: string;
  serviceId?: string;
  customerName?:string;
  serviceName?:string;
   totalPrice?: number;
  status?:string;
  day: string; 
  startTime: string;
  endTime: string;
  type: string;
  note?: string;
}
export interface IBookingSlot {
  serviceId:string;
  day: string; 
  startTime: string;
  endTime: string;
}

export interface IWeeklySlot {
  muaId: string;
  weekStart: string;      // ⚠️ RedisJSON không lưu được Date, nên nên đổi thành string ISO
  weekStartStr: string;
  slots: Record<string, ISlot>;
}

export interface IFinalSlot {
  muaId: string;
  weekStart: string;      // ⚠️ RedisJSON không lưu được Date, nên nên đổi thành string ISO
  weekStartStr: string;
  slots: ISlot[];
}
