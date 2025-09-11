export interface ISlot {
  slotId: string;
  day: string; // 'MON', 'TUE', ...
  startTime: string;
  endTime: string;
  type: string; // 'working', 'override'
  note?: string;
}

export interface IWeeklySlot {
  muaId: string;
  weekStart: Date;
  slots: ISlot[];
}

export type SlotType = 'working' | 'override' | 'blocked';