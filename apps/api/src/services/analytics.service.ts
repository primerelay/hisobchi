import { Types } from 'mongoose';
import { Order, DailyAnalytics, MenuItem, User } from '../models';
import { startOfDay, endOfDay, subDays } from '@repo/utils';
import type { DashboardStats } from '@repo/types';

export async function getDashboardStats(restaurantId: string): Promise<DashboardStats> {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = startOfDay(subDays(now, 1));
  const weekAgo = startOfDay(subDays(now, 7));
  const monthAgo = startOfDay(subDays(now, 30));

  const restaurantObjectId = new Types.ObjectId(restaurantId);

  // Today's stats (real-time)
  const todayStats = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        status: 'closed',
        closedAt: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  const todayRevenue = todayStats[0]?.revenue || 0;
  const todayOrders = todayStats[0]?.orderCount || 0;

  // Yesterday from pre-aggregated
  const yesterdayAnalytics = await DailyAnalytics.findOne({
    restaurantId: restaurantObjectId,
    date: yesterday,
  });

  // This week
  const weekStats = await DailyAnalytics.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        date: { $gte: weekAgo, $lt: today },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totals.revenue' },
        orderCount: { $sum: '$totals.orderCount' },
      },
    },
  ]);

  // This month
  const monthStats = await DailyAnalytics.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        date: { $gte: monthAgo, $lt: today },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totals.revenue' },
        orderCount: { $sum: '$totals.orderCount' },
      },
    },
  ]);

  return {
    today: {
      revenue: todayRevenue,
      orderCount: todayOrders,
      avgOrderValue: todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0,
    },
    yesterday: {
      revenue: yesterdayAnalytics?.totals.revenue || 0,
      orderCount: yesterdayAnalytics?.totals.orderCount || 0,
      avgOrderValue: yesterdayAnalytics?.totals.avgOrderValue || 0,
    },
    thisWeek: {
      revenue: (weekStats[0]?.revenue || 0) + todayRevenue,
      orderCount: (weekStats[0]?.orderCount || 0) + todayOrders,
    },
    thisMonth: {
      revenue: (monthStats[0]?.revenue || 0) + todayRevenue,
      orderCount: (monthStats[0]?.orderCount || 0) + todayOrders,
    },
  };
}

export async function getTopItems(
  restaurantId: string,
  from: Date,
  to: Date,
  limit: number = 10
) {
  const restaurantObjectId = new Types.ObjectId(restaurantId);

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        status: 'closed',
        closedAt: { $gte: from, $lte: to },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItemId',
        name: { $first: '$items.name' },
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $project: {
        menuItemId: '$_id',
        name: 1,
        quantity: 1,
        revenue: 1,
        _id: 0,
      },
    },
  ]);

  return result;
}

export async function getWaiterStats(restaurantId: string, from: Date, to: Date) {
  const restaurantObjectId = new Types.ObjectId(restaurantId);

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        status: 'closed',
        closedAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: '$waiterId',
        orderCount: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
        commission: { $sum: '$waiterCommission.amount' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'waiter',
      },
    },
    { $unwind: '$waiter' },
    {
      $project: {
        waiterId: '$_id',
        name: '$waiter.name',
        orderCount: 1,
        revenue: 1,
        commission: 1,
        _id: 0,
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return result;
}

export async function getRevenueByPeriod(
  restaurantId: string,
  from: Date,
  to: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  const restaurantObjectId = new Types.ObjectId(restaurantId);

  let dateFormat: string;
  switch (groupBy) {
    case 'week':
      dateFormat = '%Y-W%V';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId: restaurantObjectId,
        status: 'closed',
        closedAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$closedAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        revenue: 1,
        orders: 1,
        _id: 0,
      },
    },
  ]);

  return result;
}
