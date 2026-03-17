export const ORDER_STATUSES = ['open', 'closed', 'cancelled'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  open: 'Ochiq',
  closed: 'Yopilgan',
  cancelled: 'Bekor qilingan',
};

export const ORDER_STATUS_LABELS_EN: Record<OrderStatus, string> = {
  open: 'Open',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  open: 'green',
  closed: 'blue',
  cancelled: 'red',
};
