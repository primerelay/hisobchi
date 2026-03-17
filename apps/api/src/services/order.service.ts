import { Types } from 'mongoose';
import { Order, MenuItem, Room, User, Restaurant } from '../models';
import { ApiError } from '../middleware';
import type { OrderItem, CreateOrderInput, UpdateOrderInput } from '@repo/types';

export async function createOrder(
  restaurantId: string,
  waiterId: string,
  input: CreateOrderInput
) {
  // Check room exists and is active
  const room = await Room.findOne({
    _id: input.roomId,
    restaurantId,
    isActive: true,
  });

  if (!room) {
    throw new ApiError('Xona topilmadi', 404);
  }

  // Check if room has open order
  if (room.currentOrderId) {
    throw new ApiError('Bu xonada ochiq buyurtma mavjud', 400);
  }

  // Get waiter commission
  const waiter = await User.findById(waiterId);
  const restaurant = await Restaurant.findById(restaurantId);

  const commissionPercent = restaurant?.settings.commissionEnabled
    ? waiter?.commissionPercent || restaurant.settings.defaultCommission
    : 0;

  // Process items if provided
  let items: OrderItem[] = [];
  let totalPrice = 0;

  if (input.items && input.items.length > 0) {
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      restaurantId,
      isActive: true,
    });

    const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

    items = input.items
      .filter((i) => menuItemMap.has(i.menuItemId))
      .map((i) => {
        const menuItem = menuItemMap.get(i.menuItemId)!;
        const subtotal = menuItem.price * i.quantity;
        totalPrice += subtotal;
        return {
          menuItemId: menuItem._id.toString(),
          name: menuItem.name,
          price: menuItem.price,
          quantity: i.quantity,
          subtotal,
        };
      });
  }

  const commissionAmount = Math.floor(totalPrice * (commissionPercent / 100));

  const order = await Order.create({
    restaurantId,
    roomId: input.roomId,
    waiterId,
    items,
    totalPrice,
    waiterCommission: {
      percent: commissionPercent,
      amount: commissionAmount,
    },
    status: 'open',
    clientId: input.clientId,
    openedAt: new Date(),
  });

  // Update room with current order
  room.currentOrderId = order._id as Types.ObjectId;
  await room.save();

  return order;
}

export async function updateOrder(
  restaurantId: string,
  orderId: string,
  input: UpdateOrderInput
) {
  const order = await Order.findOne({
    _id: orderId,
    restaurantId,
    status: 'open',
  });

  if (!order) {
    throw new ApiError('Buyurtma topilmadi', 404);
  }

  // Get menu items
  const menuItemIds = input.items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({
    _id: { $in: menuItemIds },
    restaurantId,
  });

  const menuItemMap = new Map(menuItems.map((m) => [m._id.toString(), m]));

  // Build new items list
  let totalPrice = 0;
  const items: OrderItem[] = input.items
    .filter((i) => i.quantity > 0 && menuItemMap.has(i.menuItemId))
    .map((i) => {
      const menuItem = menuItemMap.get(i.menuItemId)!;
      const subtotal = menuItem.price * i.quantity;
      totalPrice += subtotal;
      return {
        menuItemId: menuItem._id.toString(),
        name: menuItem.name,
        price: menuItem.price,
        quantity: i.quantity,
        subtotal,
      };
    });

  const commissionAmount = Math.floor(totalPrice * (order.waiterCommission.percent / 100));

  order.items = items;
  order.totalPrice = totalPrice;
  order.waiterCommission.amount = commissionAmount;

  await order.save();

  return order;
}

export async function closeOrder(restaurantId: string, orderId: string) {
  const order = await Order.findOne({
    _id: orderId,
    restaurantId,
    status: 'open',
  });

  if (!order) {
    throw new ApiError('Buyurtma topilmadi', 404);
  }

  if (order.items.length === 0) {
    throw new ApiError('Bo\'sh buyurtmani yopib bo\'lmaydi', 400);
  }

  order.status = 'closed';
  order.closedAt = new Date();
  await order.save();

  // Clear room's current order
  await Room.updateOne(
    { _id: order.roomId },
    { currentOrderId: null }
  );

  return order;
}

export async function cancelOrder(
  restaurantId: string,
  orderId: string,
  reason: string
) {
  const order = await Order.findOne({
    _id: orderId,
    restaurantId,
  });

  if (!order) {
    throw new ApiError('Buyurtma topilmadi', 404);
  }

  if (order.status === 'cancelled') {
    throw new ApiError('Buyurtma allaqachon bekor qilingan', 400);
  }

  order.status = 'cancelled';
  order.cancelReason = reason;
  order.closedAt = new Date();
  await order.save();

  // Clear room's current order if this was the open order
  await Room.updateOne(
    { _id: order.roomId, currentOrderId: order._id },
    { currentOrderId: null }
  );

  return order;
}

export async function getCurrentOrderForRoom(restaurantId: string, roomId: string) {
  const order = await Order.findOne({
    restaurantId,
    roomId,
    status: 'open',
  });

  return order;
}

export async function getOrCreateOrderForRoom(
  restaurantId: string,
  waiterId: string,
  roomId: string
) {
  // Check for existing open order
  let order = await Order.findOne({
    restaurantId,
    roomId,
    status: 'open',
  });

  if (order) {
    return { order, created: false };
  }

  // Check room exists and is active
  const room = await Room.findOne({
    _id: roomId,
    restaurantId,
    isActive: true,
  });

  if (!room) {
    throw new ApiError('Xona topilmadi', 404);
  }

  // Get waiter commission
  const waiter = await User.findById(waiterId);
  const restaurant = await Restaurant.findById(restaurantId);

  const commissionPercent = restaurant?.settings.commissionEnabled
    ? waiter?.commissionPercent || restaurant.settings.defaultCommission
    : 0;

  // Create new order
  order = await Order.create({
    restaurantId,
    roomId,
    waiterId,
    items: [],
    totalPrice: 0,
    waiterCommission: {
      percent: commissionPercent,
      amount: 0,
    },
    status: 'open',
    openedAt: new Date(),
  });

  // Update room with current order
  room.currentOrderId = order._id as Types.ObjectId;
  await room.save();

  return { order, created: true };
}

export async function addItemToOrder(
  restaurantId: string,
  orderId: string,
  menuItemId: string,
  quantity: number = 1
) {
  const order = await Order.findOne({
    _id: orderId,
    restaurantId,
    status: 'open',
  });

  if (!order) {
    throw new ApiError('Buyurtma topilmadi', 404);
  }

  const menuItem = await MenuItem.findOne({
    _id: menuItemId,
    restaurantId,
    isActive: true,
  });

  if (!menuItem) {
    throw new ApiError('Taom topilmadi', 404);
  }

  const existingIndex = order.items.findIndex(
    (i) => i.menuItemId === menuItemId
  );

  if (existingIndex >= 0) {
    order.items[existingIndex].quantity += quantity;
    order.items[existingIndex].subtotal =
      order.items[existingIndex].price * order.items[existingIndex].quantity;
  } else {
    order.items.push({
      menuItemId: menuItem._id.toString(),
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      subtotal: menuItem.price * quantity,
    });
  }

  order.totalPrice = order.items.reduce((sum, i) => sum + i.subtotal, 0);
  order.waiterCommission.amount = Math.floor(
    order.totalPrice * (order.waiterCommission.percent / 100)
  );

  await order.save();

  return order;
}
