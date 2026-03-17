export interface CategoryStats {
  revenue: number;
  quantity: number;
}

export interface TopItem {
  menuItemId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface WaiterStats {
  waiterId: string;
  name: string;
  orderCount: number;
  revenue: number;
  commission: number;
}

export interface HourlyStats {
  hour: number;
  orderCount: number;
  revenue: number;
}

export interface DailyAnalytics {
  _id: string;
  restaurantId: string;
  date: Date;
  totals: {
    revenue: number;
    orderCount: number;
    avgOrderValue: number;
  };
  byCategory: {
    food: CategoryStats;
    drink: CategoryStats;
    service: CategoryStats;
  };
  topItems: TopItem[];
  byWaiter: WaiterStats[];
  byHour: HourlyStats[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  today: {
    revenue: number;
    orderCount: number;
    avgOrderValue: number;
  };
  yesterday: {
    revenue: number;
    orderCount: number;
    avgOrderValue: number;
  };
  thisWeek: {
    revenue: number;
    orderCount: number;
  };
  thisMonth: {
    revenue: number;
    orderCount: number;
  };
}
