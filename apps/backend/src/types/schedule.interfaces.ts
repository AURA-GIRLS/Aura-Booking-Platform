export interface ISlot {
  slotId: string;
  day: string; 
  startTime: string;
  endTime: string;
  type: string;
  note?: string;
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
