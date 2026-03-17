# OshxonaPOS — SaaS MVP Architecture Document

---

## SECTION 1 — PRODUCT OVERVIEW

### Problem Statement

Small restaurants, teahouses, and eateries in Uzbekistan rely on paper-based order tracking:

| Problem | Impact |
|---------|--------|
| Manual calculations | Errors in totals, revenue loss |
| Paper orders | Lost orders, disputes |
| No sales tracking | Cannot analyze performance |
| No waiter accountability | Commission disputes |
| Slow checkout | Poor customer experience |

### Solution

A mobile-first PWA that digitizes the entire order workflow:

```
Waiter opens room → Adds items → System calculates total → Order saved → Analytics generated
```

### Target Users

| Actor | Description |
|-------|-------------|
| **Super Admin** | Platform owner, manages restaurants |
| **Restaurant Admin** | Restaurant owner, manages menu/waiters/rooms |
| **Waiter** | Takes orders, views commission |

### Core Value Proposition

- **Zero calculation errors** — automatic totals
- **Offline-first** — works without internet
- **Waiter commission** — automatic tracking
- **Sales analytics** — daily/weekly/monthly reports
- **Multi-tenant** — one platform, many restaurants

---

## SECTION 2 — MVP SCOPE

### In Scope (MVP)

```
✓ Super Admin
  - Create/manage restaurants
  - View platform analytics
  - Manage restaurant admins

✓ Restaurant Admin
  - CRUD menu items (name, price, category, image)
  - CRUD rooms
  - CRUD waiters (with commission %)
  - View orders
  - View analytics (sales, top items, waiter performance)
  - Restaurant settings

✓ Waiter
  - Phone/password login
  - Select room
  - Add/remove items to order
  - View running total + commission
  - Close order
  - View personal stats

✓ System
  - Offline mode with sync
  - PWA installable
  - Multi-tenant data isolation
  - Default images for menu items
```

### Out of Scope (Post-MVP)

```
✗ Receipt printing
✗ Telegram notifications
✗ Inventory management
✗ Multi-branch restaurants
✗ POS hardware
✗ Customer loyalty
✗ Table reservations
✗ Kitchen display system
✗ Payment gateway integration
```

---

## SECTION 3 — MONOREPO ARCHITECTURE

### Tooling Decision

```
pnpm workspaces + turborepo
```

**Why pnpm:**
- Fastest package manager
- Disk-efficient (symlinks)
- Strict dependency resolution
- Native workspace support

**Why turborepo:**
- Intelligent caching
- Parallel task execution
- Dependency-aware builds
- Remote caching (optional)

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Package Dependency Graph

```
                    ┌─────────────────┐
                    │   @repo/types   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │@repo/utils│   │@repo/const│   │@repo/valid│
       └─────┬────┘   └─────┬────┘   └─────┬────┘
             │              │              │
             └──────────────┼──────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌─────────┐   ┌─────────┐   ┌─────────┐
        │ @repo/ui│   │@repo/api│   │@repo/db │
        └────┬────┘   └────┬────┘   └────┬────┘
             │             │             │
             └─────────────┼─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
               ┌────────┐   ┌────────┐
               │apps/web│   │apps/api│
               └────────┘   └────────┘
```

---

## SECTION 4 — SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│   │    Waiter    │    │   Restaurant │    │    Super     │         │
│   │   (Mobile)   │    │    Admin     │    │    Admin     │         │
│   │    PWA       │    │   (Desktop)  │    │   (Desktop)  │         │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘         │
│          │                   │                   │                  │
│          │    ┌──────────────┴───────────────────┘                  │
│          │    │                                                      │
│          ▼    ▼                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                    apps/web (React PWA)                      │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│   │  │Service Worker│  │  IndexedDB  │  │  Background Sync   │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│   └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────────────────────────────────────────────────────┐    │
│   │                    apps/api (Express.js)                     │    │
│   │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │    │
│   │  │   Auth    │  │   Multi   │  │   API     │  │   File   │  │    │
│   │  │   JWT     │  │  Tenant   │  │  Routes   │  │  Upload  │  │    │
│   │  └───────────┘  └───────────┘  └───────────┘  └──────────┘  │    │
│   └──────────────────────────┬──────────────────────────────────┘    │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  MongoDB   │   │ Cloudinary │   │   Redis    │
       │   Atlas    │   │  (Images)  │   │ (Sessions) │
       └────────────┘   └────────────┘   └────────────┘
```

### Multi-Tenant Data Isolation

```
Strategy: Collection-level isolation with restaurantId filter

Every query automatically scoped:
  db.orders.find({ restaurantId: ctx.restaurantId, ...query })

Middleware enforces tenant context:
  req.tenantId = decoded.restaurantId
```

---

## SECTION 5 — DATABASE DESIGN

### Collections Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Collections                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Platform Level (no restaurantId)                          │
│   ├── restaurants                                            │
│   └── superAdmins                                            │
│                                                              │
│   Tenant Level (scoped by restaurantId)                     │
│   ├── users (admins + waiters)                              │
│   ├── menuItems                                              │
│   ├── rooms                                                  │
│   ├── orders                                                 │
│   └── analytics (aggregated daily)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Schema Definitions

```typescript
// restaurants
{
  _id: ObjectId,
  name: string,                    // "Milliy Taomlar"
  slug: string,                    // "milliy-taomlar" (unique)
  phone: string,
  address: string,
  logo: string,                    // Cloudinary URL
  settings: {
    currency: string,              // "UZS"
    commissionEnabled: boolean,    // true
    defaultCommission: number,     // 10 (percent)
    timezone: string,              // "Asia/Tashkent"
  },
  subscription: {
    plan: enum,                    // "trial" | "basic" | "premium"
    expiresAt: Date,
  },
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}

// Index: { slug: 1 } unique

// users
{
  _id: ObjectId,
  restaurantId: ObjectId,          // tenant scope
  role: enum,                      // "admin" | "waiter"
  name: string,                    // "Akmal"
  phone: string,                   // "+998901234567"
  passwordHash: string,
  commissionPercent: number,       // 10 (waiter only)
  isActive: boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date,
}

// Index: { restaurantId: 1, phone: 1 } unique
// Index: { restaurantId: 1, role: 1 }

// menuItems
{
  _id: ObjectId,
  restaurantId: ObjectId,
  name: string,                    // "Osh"
  price: number,                   // 45000 (in tiyin or so'm)
  category: enum,                  // "food" | "drink" | "service"
  image: string,                   // Cloudinary URL or default
  sortOrder: number,               // for custom ordering
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}

// Index: { restaurantId: 1, category: 1, isActive: 1 }
// Index: { restaurantId: 1, sortOrder: 1 }

// rooms
{
  _id: ObjectId,
  restaurantId: ObjectId,
  name: string,                    // "Room 1"
  sortOrder: number,
  isActive: boolean,
  currentOrderId: ObjectId | null, // active order in room
  createdAt: Date,
  updatedAt: Date,
}

// Index: { restaurantId: 1, isActive: 1, sortOrder: 1 }

// orders
{
  _id: ObjectId,
  restaurantId: ObjectId,
  roomId: ObjectId,
  waiterId: ObjectId,

  items: [{
    menuItemId: ObjectId,
    name: string,                  // denormalized for history
    price: number,                 // denormalized (price at order time)
    quantity: number,
    subtotal: number,              // price * quantity
  }],

  totalPrice: number,              // sum of subtotals

  waiterCommission: {
    percent: number,
    amount: number,
  },

  status: enum,                    // "open" | "closed" | "cancelled"

  // Offline sync fields
  clientId: string,                // UUID generated on client
  syncedAt: Date | null,           // when synced from offline

  openedAt: Date,
  closedAt: Date | null,
  createdAt: Date,
  updatedAt: Date,
}

// Index: { restaurantId: 1, status: 1, openedAt: -1 }
// Index: { restaurantId: 1, waiterId: 1, closedAt: -1 }
// Index: { restaurantId: 1, clientId: 1 } unique sparse
// Index: { roomId: 1, status: 1 }

// dailyAnalytics (pre-aggregated)
{
  _id: ObjectId,
  restaurantId: ObjectId,
  date: Date,                      // YYYY-MM-DD 00:00:00 UTC

  totals: {
    revenue: number,
    orderCount: number,
    avgOrderValue: number,
  },

  byCategory: {
    food: { revenue: number, quantity: number },
    drink: { revenue: number, quantity: number },
    service: { revenue: number, quantity: number },
  },

  topItems: [{
    menuItemId: ObjectId,
    name: string,
    quantity: number,
    revenue: number,
  }],

  byWaiter: [{
    waiterId: ObjectId,
    name: string,
    orderCount: number,
    revenue: number,
    commission: number,
  }],

  byHour: [{
    hour: number,                  // 0-23
    orderCount: number,
    revenue: number,
  }],

  createdAt: Date,
  updatedAt: Date,
}

// Index: { restaurantId: 1, date: -1 } unique

// superAdmins
{
  _id: ObjectId,
  email: string,
  passwordHash: string,
  name: string,
  permissions: string[],           // ["*"] or specific
  isActive: boolean,
  createdAt: Date,
}

// Index: { email: 1 } unique
```

### Default Images

```typescript
const DEFAULT_IMAGES = {
  food: 'https://res.cloudinary.com/oshxona/image/upload/defaults/food.png',
  drink: 'https://res.cloudinary.com/oshxona/image/upload/defaults/drink.png',
  service: 'https://res.cloudinary.com/oshxona/image/upload/defaults/service.png',
  restaurant: 'https://res.cloudinary.com/oshxona/image/upload/defaults/restaurant.png',
};
```

---

## SECTION 6 — ORDER WORKFLOW

### State Machine

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    ▼                                         │
              ┌──────────┐                                    │
              │   OPEN   │◄────────────────────────┐         │
              └────┬─────┘                         │         │
                   │                               │         │
         ┌─────────┼─────────┐                     │         │
         │         │         │                     │         │
         ▼         ▼         ▼                     │         │
    ┌────────┐ ┌───────┐ ┌────────┐               │         │
    │Add Item│ │Remove │ │ Clear  │───────────────┘         │
    │        │ │ Item  │ │ Order  │                          │
    └────┬───┘ └───┬───┘ └────────┘                          │
         │         │                                          │
         └────┬────┘                                          │
              │                                               │
              ▼                                               │
        ┌──────────┐        ┌───────────┐                    │
        │  CLOSE   │───────►│  CLOSED   │                    │
        │  ORDER   │        │           │                    │
        └──────────┘        └───────────┘                    │
              │                                               │
              │ (optional)                                    │
              ▼                                               │
        ┌───────────┐                                         │
        │ CANCELLED │◄────────────────────────────────────────┘
        └───────────┘
```

### Order Lifecycle

```
1. ROOM SELECTION
   └─► Waiter taps room card
   └─► If room has open order → resume it
   └─► If room empty → create new order

2. ITEM MANAGEMENT
   └─► Tap + to add item (or increment)
   └─► Tap - to decrement (remove if 0)
   └─► Real-time total calculation
   └─► Commission shown if enabled

3. ORDER CLOSE
   └─► Waiter taps "Close Order"
   └─► Confirmation modal shown
   └─► Order status → "closed"
   └─► Room.currentOrderId → null
   └─► Analytics updated

4. ORDER CANCEL (Admin only)
   └─► Admin selects order
   └─► Provides reason
   └─► Order status → "cancelled"
   └─► Excluded from analytics
```

### Total Calculation

```typescript
function calculateOrderTotal(items: OrderItem[]): OrderTotals {
  const subtotals = items.map(item => item.price * item.quantity);
  const totalPrice = subtotals.reduce((sum, s) => sum + s, 0);

  return {
    items: items.map((item, i) => ({
      ...item,
      subtotal: subtotals[i],
    })),
    totalPrice,
  };
}

function calculateCommission(
  totalPrice: number,
  commissionPercent: number
): number {
  return Math.floor(totalPrice * (commissionPercent / 100));
}
```

---

## SECTION 7 — OFFLINE SYNC LOGIC

### Sync Strategy: Offline-First with Conflict Resolution

```
┌─────────────────────────────────────────────────────────────────┐
│                    OFFLINE SYNC ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                     IndexedDB                            │   │
│   │                                                          │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│   │   │  menuItems  │  │    rooms    │  │   orders    │    │   │
│   │   │   (cache)   │  │   (cache)   │  │  (primary)  │    │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘    │   │
│   │                                                          │   │
│   │   ┌─────────────┐  ┌─────────────┐                     │   │
│   │   │  syncQueue  │  │   metadata  │                     │   │
│   │   │  (pending)  │  │ (lastSync)  │                     │   │
│   │   └─────────────┘  └─────────────┘                     │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ Sync Manager                      │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   Service Worker                         │   │
│   │                                                          │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│   │   │   Cache     │  │  Background │  │    Fetch    │    │   │
│   │   │   Storage   │  │    Sync     │  │  Intercept  │    │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘    │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Sync Queue Structure

```typescript
interface SyncQueueItem {
  id: string;              // UUID
  type: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'CLOSE_ORDER';
  payload: object;
  createdAt: number;       // timestamp
  attempts: number;
  lastAttemptAt: number | null;
  status: 'pending' | 'syncing' | 'failed';
}
```

### Sync Algorithm

```typescript
async function syncPendingOperations() {
  const queue = await db.syncQueue
    .where('status')
    .equals('pending')
    .sortBy('createdAt');

  for (const item of queue) {
    try {
      await db.syncQueue.update(item.id, { status: 'syncing' });

      const response = await api.sync(item);

      if (response.ok) {
        // Update local order with server ID
        if (item.type === 'CREATE_ORDER') {
          await db.orders.update(item.payload.clientId, {
            _id: response.data._id,
            syncedAt: new Date(),
          });
        }

        // Remove from queue
        await db.syncQueue.delete(item.id);
      }
    } catch (error) {
      await db.syncQueue.update(item.id, {
        status: 'failed',
        attempts: item.attempts + 1,
        lastAttemptAt: Date.now(),
      });

      // Exponential backoff
      if (item.attempts < 5) {
        scheduleRetry(item, Math.pow(2, item.attempts) * 1000);
      }
    }
  }
}
```

### Conflict Resolution

```
Strategy: Last-Write-Wins with Client Priority

1. Server receives order with clientId
2. Check if clientId exists:
   - If NOT exists: Create new order
   - If exists: Compare timestamps
     - If client timestamp > server: Update with client data
     - If server timestamp > client: Return server data, client updates

3. Items within order:
   - Merge by menuItemId
   - Take higher quantity (prevents accidental decrements)
   - Recalculate totals
```

### Online/Offline Detection

```typescript
class NetworkStatus {
  private online = navigator.onLine;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));

    // Heartbeat check (navigator.onLine isn't always reliable)
    setInterval(() => this.checkConnection(), 30000);
  }

  private async checkConnection() {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      this.setOnline(response.ok);
    } catch {
      this.setOnline(false);
    }
  }

  private setOnline(online: boolean) {
    if (this.online !== online) {
      this.online = online;
      this.listeners.forEach(fn => fn(online));

      if (online) {
        // Trigger sync when coming online
        syncPendingOperations();
      }
    }
  }
}
```

---

## SECTION 8 — ACTOR FLOWS

### 8.1 Super Admin Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPER ADMIN FLOWS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LOGIN                                                           │
│  ├─► Navigate to /super-admin/login                             │
│  ├─► Enter email + password                                      │
│  ├─► Receive JWT token                                           │
│  └─► Redirect to /super-admin/dashboard                         │
│                                                                  │
│  CREATE RESTAURANT                                               │
│  ├─► Click "Add Restaurant"                                      │
│  ├─► Fill form:                                                  │
│  │   • Name                                                      │
│  │   • Slug (auto-generated, editable)                          │
│  │   • Phone                                                     │
│  │   • Address                                                   │
│  │   • Logo (optional)                                          │
│  │   • Subscription plan                                        │
│  ├─► Create admin account:                                       │
│  │   • Admin name                                                │
│  │   • Admin phone                                               │
│  │   • Temporary password                                        │
│  ├─► Submit → Restaurant created                                 │
│  └─► Admin receives credentials (SMS/manual)                    │
│                                                                  │
│  VIEW PLATFORM ANALYTICS                                         │
│  ├─► Total restaurants (active/inactive)                        │
│  ├─► Total revenue (all restaurants)                            │
│  ├─► Total orders (all restaurants)                             │
│  ├─► New restaurants this month                                 │
│  └─► Revenue by restaurant (table)                              │
│                                                                  │
│  MANAGE RESTAURANT                                               │
│  ├─► Edit restaurant details                                     │
│  ├─► Extend/change subscription                                 │
│  ├─► Activate/deactivate                                         │
│  └─► Reset admin password                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Restaurant Admin Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                   RESTAURANT ADMIN FLOWS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LOGIN                                                           │
│  ├─► Navigate to /login                                          │
│  ├─► Enter phone + password                                      │
│  ├─► Receive JWT token (includes restaurantId)                  │
│  └─► Redirect to /dashboard                                      │
│                                                                  │
│  MENU MANAGEMENT                                                 │
│  ├─► View all items (grouped by category)                       │
│  ├─► Add item:                                                   │
│  │   • Name (required)                                          │
│  │   • Price (required)                                         │
│  │   • Category (required)                                      │
│  │   • Image (optional → default used)                          │
│  ├─► Edit item (name, price, image)                             │
│  ├─► Toggle item active/inactive                                │
│  └─► Reorder items (drag-drop)                                  │
│                                                                  │
│  WAITER MANAGEMENT                                               │
│  ├─► View all waiters                                            │
│  ├─► Add waiter:                                                 │
│  │   • Name                                                      │
│  │   • Phone                                                     │
│  │   • Password                                                  │
│  │   • Commission % (if enabled)                                │
│  ├─► Edit waiter details                                         │
│  ├─► Toggle active/inactive                                      │
│  └─► View waiter performance                                    │
│                                                                  │
│  ROOM MANAGEMENT                                                 │
│  ├─► View all rooms                                              │
│  ├─► Add room (name)                                             │
│  ├─► Edit room name                                              │
│  ├─► Toggle active/inactive                                      │
│  ├─► View current order in room                                 │
│  └─► Reorder rooms                                               │
│                                                                  │
│  ORDER MANAGEMENT                                                │
│  ├─► View open orders (real-time)                               │
│  ├─► View order history                                          │
│  ├─► Filter by:                                                  │
│  │   • Date range                                                │
│  │   • Waiter                                                    │
│  │   • Room                                                      │
│  │   • Status                                                    │
│  └─► Cancel order (with reason)                                 │
│                                                                  │
│  ANALYTICS                                                       │
│  ├─► Dashboard overview:                                         │
│  │   • Today's revenue                                          │
│  │   • Today's orders                                            │
│  │   • Average order value                                      │
│  ├─► Sales reports (daily/weekly/monthly)                       │
│  ├─► Top selling items                                          │
│  ├─► Waiter performance                                          │
│  └─► Peak hours analysis                                        │
│                                                                  │
│  SETTINGS                                                        │
│  ├─► Restaurant name/logo                                        │
│  ├─► Enable/disable commission system                           │
│  ├─► Default commission percentage                              │
│  └─► Change admin password                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Waiter Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                        WAITER FLOWS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LOGIN                                                           │
│  ├─► Navigate to /waiter/login                                   │
│  ├─► Enter phone + password                                      │
│  ├─► App downloads menu & rooms to IndexedDB                    │
│  └─► Redirect to room selection                                 │
│                                                                  │
│  ROOM SELECTION                                                  │
│  ├─► View room grid (large cards)                               │
│  ├─► Room states:                                                │
│  │   • Empty (green) → Tap to start order                       │
│  │   • Occupied (orange) → Shows order total                    │
│  │   • My order (blue) → Resume my order                        │
│  └─► Tap room → Go to order screen                              │
│                                                                  │
│  ORDER SCREEN                                                    │
│  ├─► Menu displayed:                                             │
│  │   • Category tabs (food/drink/service)                       │
│  │   • Item cards (image, name, price)                          │
│  │   • +/- buttons per item                                     │
│  │   • Current quantity badge                                   │
│  │                                                               │
│  ├─► Sticky footer always visible:                              │
│  │   • Total: XXX,XXX so'm                                      │
│  │   • Your share: XX,XXX so'm (if commission on)               │
│  │   • [Clear] [Close Order]                                    │
│  │                                                               │
│  ├─► Clear order:                                                │
│  │   • Confirmation modal                                        │
│  │   • Removes all items                                        │
│  │   • Order stays open                                          │
│  │                                                               │
│  └─► Close order:                                                │
│      • Confirmation modal with summary                          │
│      • Order status → closed                                    │
│      • Return to room selection                                 │
│                                                                  │
│  OFFLINE MODE                                                    │
│  ├─► Works identically to online                                │
│  ├─► Small indicator: "Offline" badge                           │
│  ├─► All operations saved to IndexedDB                          │
│  └─► Auto-sync when online                                      │
│                                                                  │
│  MY STATS                                                        │
│  ├─► Today's orders                                              │
│  ├─► Today's revenue                                             │
│  ├─► Today's commission                                          │
│  └─► Weekly summary                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 9 — SUPER ADMIN RESTAURANT CREATION FLOW

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              RESTAURANT ONBOARDING FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1: RESTAURANT INFO                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Restaurant Name:  [Milliy Taomlar___________________]    │ │
│  │                                                            │ │
│  │  URL Slug:         [milliy-taomlar___________________]    │ │
│  │                    (auto-generated, can edit)              │ │
│  │                                                            │ │
│  │  Phone:            [+998 90 123 45 67________________]    │ │
│  │                                                            │ │
│  │  Address:          [Tashkent, Chilonzor 12__________]     │ │
│  │                                                            │ │
│  │  Logo:             [Upload] or use default                 │ │
│  │                                                            │ │
│  │                                          [Next →]          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  STEP 2: ADMIN ACCOUNT                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Admin Name:       [Akmal Karimov___________________]     │ │
│  │                                                            │ │
│  │  Admin Phone:      [+998 90 765 43 21________________]    │ │
│  │                                                            │ │
│  │  Temporary Password: [Auto-generated: aX7#kL9m]           │ │
│  │                      [Regenerate]                          │ │
│  │                                                            │ │
│  │  ☐ Send credentials via SMS (if SMS configured)           │ │
│  │                                                            │ │
│  │                                [← Back]  [Next →]          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  STEP 3: SUBSCRIPTION                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Select Plan:                                              │ │
│  │                                                            │ │
│  │  ◉ Trial (14 days free)                                   │ │
│  │  ○ Basic (100,000 so'm/month)                             │ │
│  │  ○ Premium (250,000 so'm/month)                           │ │
│  │                                                            │ │
│  │  Start Date:       [Today]                                 │ │
│  │                                                            │ │
│  │                                [← Back]  [Next →]          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  STEP 4: INITIAL SETUP (Optional)                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Pre-populate with sample data:                           │ │
│  │                                                            │ │
│  │  ☑ Create sample menu items (10 items)                    │ │
│  │  ☑ Create 5 rooms (Room 1 - Room 5)                       │ │
│  │  ☐ Enable commission system (default 10%)                 │ │
│  │                                                            │ │
│  │                                [← Back]  [Create →]        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  STEP 5: CONFIRMATION                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ✓ Restaurant Created Successfully!                       │ │
│  │                                                            │ │
│  │  Restaurant: Milliy Taomlar                               │ │
│  │  URL: https://app.oshxona.uz/milliy-taomlar               │ │
│  │                                                            │ │
│  │  Admin Credentials:                                        │ │
│  │  Phone: +998 90 765 43 21                                 │ │
│  │  Password: aX7#kL9m                                        │ │
│  │                                                            │ │
│  │  [Copy Credentials]  [Send SMS]  [Done]                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Operations

```typescript
async function createRestaurant(data: CreateRestaurantInput) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create restaurant
    const restaurant = await Restaurant.create([{
      name: data.name,
      slug: data.slug,
      phone: data.phone,
      address: data.address,
      logo: data.logo || DEFAULT_IMAGES.restaurant,
      settings: {
        currency: 'UZS',
        commissionEnabled: data.commissionEnabled ?? false,
        defaultCommission: data.defaultCommission ?? 10,
        timezone: 'Asia/Tashkent',
      },
      subscription: {
        plan: data.plan,
        expiresAt: calculateExpiry(data.plan),
      },
      isActive: true,
    }], { session });

    // 2. Create admin user
    const passwordHash = await bcrypt.hash(data.adminPassword, 12);
    await User.create([{
      restaurantId: restaurant[0]._id,
      role: 'admin',
      name: data.adminName,
      phone: data.adminPhone,
      passwordHash,
      isActive: true,
    }], { session });

    // 3. Create sample data if requested
    if (data.createSampleData) {
      await createSampleMenuItems(restaurant[0]._id, session);
      await createSampleRooms(restaurant[0]._id, session);
    }

    await session.commitTransaction();

    return restaurant[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## SECTION 10 — REST API DESIGN

### API Base Structure

```
Base URL: /api/v1

Authentication: Bearer JWT token in Authorization header
Content-Type: application/json
```

### Authentication Endpoints

```
POST   /api/v1/auth/login
       Body: { phone, password }
       Response: { token, user: { id, name, role, restaurantId } }

POST   /api/v1/auth/logout
       Response: { success: true }

GET    /api/v1/auth/me
       Response: { user }

POST   /api/v1/auth/change-password
       Body: { currentPassword, newPassword }

POST   /api/v1/auth/super-admin/login
       Body: { email, password }
       Response: { token, admin }
```

### Restaurant Endpoints (Admin)

```
GET    /api/v1/restaurant
       Response: { restaurant }
       Scope: Current tenant

PATCH  /api/v1/restaurant
       Body: { name?, phone?, address?, logo?, settings? }
       Response: { restaurant }

GET    /api/v1/restaurant/stats
       Query: { from?, to? }
       Response: { revenue, orders, avgOrder, topItems, waiterStats }
```

### Menu Item Endpoints

```
GET    /api/v1/menu-items
       Query: { category?, isActive?, search? }
       Response: { items: [...] }

POST   /api/v1/menu-items
       Body: { name, price, category, image? }
       Response: { item }

GET    /api/v1/menu-items/:id
       Response: { item }

PATCH  /api/v1/menu-items/:id
       Body: { name?, price?, category?, image?, isActive?, sortOrder? }
       Response: { item }

DELETE /api/v1/menu-items/:id
       Response: { success: true }

POST   /api/v1/menu-items/reorder
       Body: { items: [{ id, sortOrder }] }
       Response: { success: true }

POST   /api/v1/menu-items/:id/upload-image
       Body: FormData (image file)
       Response: { imageUrl }
```

### Room Endpoints

```
GET    /api/v1/rooms
       Query: { isActive? }
       Response: { rooms: [...] }

POST   /api/v1/rooms
       Body: { name }
       Response: { room }

PATCH  /api/v1/rooms/:id
       Body: { name?, isActive?, sortOrder? }
       Response: { room }

DELETE /api/v1/rooms/:id
       Response: { success: true }
```

### Waiter Endpoints (Admin only)

```
GET    /api/v1/waiters
       Query: { isActive? }
       Response: { waiters: [...] }

POST   /api/v1/waiters
       Body: { name, phone, password, commissionPercent? }
       Response: { waiter }

GET    /api/v1/waiters/:id
       Response: { waiter }

PATCH  /api/v1/waiters/:id
       Body: { name?, phone?, password?, commissionPercent?, isActive? }
       Response: { waiter }

GET    /api/v1/waiters/:id/stats
       Query: { from?, to? }
       Response: { orders, revenue, commission }
```

### Order Endpoints

```
GET    /api/v1/orders
       Query: { status?, roomId?, waiterId?, from?, to?, page?, limit? }
       Response: { orders: [...], pagination }

POST   /api/v1/orders
       Body: { roomId, items: [{ menuItemId, quantity }], clientId? }
       Response: { order }

GET    /api/v1/orders/:id
       Response: { order }

PATCH  /api/v1/orders/:id
       Body: { items?: [...] }
       Response: { order }

POST   /api/v1/orders/:id/close
       Response: { order }

POST   /api/v1/orders/:id/cancel
       Body: { reason }
       Response: { order }
       Scope: Admin only

GET    /api/v1/orders/room/:roomId/current
       Response: { order } or 404
```

### Sync Endpoints (Offline Support)

```
POST   /api/v1/sync/orders
       Body: { operations: [{ type, payload, clientId, timestamp }] }
       Response: { results: [{ clientId, serverId, status }] }

GET    /api/v1/sync/pull
       Query: { lastSyncAt }
       Response: {
         menuItems: [...],
         rooms: [...],
         orders: [...],
         timestamp
       }
```

### Super Admin Endpoints

```
GET    /api/v1/super-admin/restaurants
       Query: { search?, isActive?, page?, limit? }
       Response: { restaurants: [...], pagination }

POST   /api/v1/super-admin/restaurants
       Body: { name, slug, phone, address, adminName, adminPhone, adminPassword, plan }
       Response: { restaurant, admin }

GET    /api/v1/super-admin/restaurants/:id
       Response: { restaurant, admin, stats }

PATCH  /api/v1/super-admin/restaurants/:id
       Body: { name?, isActive?, subscription? }
       Response: { restaurant }

POST   /api/v1/super-admin/restaurants/:id/reset-admin-password
       Body: { newPassword }
       Response: { success: true }

GET    /api/v1/super-admin/stats
       Response: { totalRestaurants, activeRestaurants, totalRevenue, ... }
```

### Analytics Endpoints

```
GET    /api/v1/analytics/dashboard
       Response: { today, yesterday, thisWeek, thisMonth }

GET    /api/v1/analytics/revenue
       Query: { from, to, groupBy: 'day' | 'week' | 'month' }
       Response: { data: [{ date, revenue, orders }] }

GET    /api/v1/analytics/top-items
       Query: { from, to, limit? }
       Response: { items: [{ menuItemId, name, quantity, revenue }] }

GET    /api/v1/analytics/waiters
       Query: { from, to }
       Response: { waiters: [{ waiterId, name, orders, revenue, commission }] }

GET    /api/v1/analytics/hourly
       Query: { from, to }
       Response: { hours: [{ hour, orders, revenue }] }
```

### Health Endpoint

```
GET    /api/v1/health
       Response: { status: 'ok', timestamp }
       Purpose: Connection check for offline detection
```

---

## SECTION 11 — MONOREPO FOLDER STRUCTURE

```
hisobchi/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   ├── cloudinary.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── tenant.ts
│   │   │   │   ├── error.ts
│   │   │   │   ├── validate.ts
│   │   │   │   └── upload.ts
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── Restaurant.ts
│   │   │   │   ├── User.ts
│   │   │   │   ├── MenuItem.ts
│   │   │   │   ├── Room.ts
│   │   │   │   ├── Order.ts
│   │   │   │   ├── DailyAnalytics.ts
│   │   │   │   ├── SuperAdmin.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── restaurant.ts
│   │   │   │   ├── menuItems.ts
│   │   │   │   ├── rooms.ts
│   │   │   │   ├── waiters.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── sync.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── superAdmin.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── order.service.ts
│   │   │   │   ├── analytics.service.ts
│   │   │   │   ├── sync.service.ts
│   │   │   │   └── image.service.ts
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   └── aggregateAnalytics.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   └── express.d.ts
│   │   │   │
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   │
│   │   ├── tests/
│   │   │   ├── setup.ts
│   │   │   ├── auth.test.ts
│   │   │   ├── orders.test.ts
│   │   │   └── sync.test.ts
│   │   │
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nodemon.json
│   │
│   └── web/
│       ├── public/
│       │   ├── manifest.json
│       │   ├── sw.js
│       │   ├── icons/
│       │   │   ├── icon-192.png
│       │   │   └── icon-512.png
│       │   └── index.html
│       │
│       ├── src/
│       │   ├── components/
│       │   │   ├── common/
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Modal.tsx
│       │   │   │   ├── Card.tsx
│       │   │   │   ├── Spinner.tsx
│       │   │   │   ├── Badge.tsx
│       │   │   │   ├── Toast.tsx
│       │   │   │   └── index.ts
│       │   │   │
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── MobileNav.tsx
│       │   │   │   ├── AdminLayout.tsx
│       │   │   │   └── WaiterLayout.tsx
│       │   │   │
│       │   │   └── features/
│       │   │       ├── menu/
│       │   │       │   ├── MenuItemCard.tsx
│       │   │       │   ├── MenuItemForm.tsx
│       │   │       │   ├── CategoryTabs.tsx
│       │   │       │   └── MenuGrid.tsx
│       │   │       │
│       │   │       ├── orders/
│       │   │       │   ├── OrderSummary.tsx
│       │   │       │   ├── OrderItemRow.tsx
│       │   │       │   ├── OrderHistory.tsx
│       │   │       │   └── CloseOrderModal.tsx
│       │   │       │
│       │   │       ├── rooms/
│       │   │       │   ├── RoomCard.tsx
│       │   │       │   ├── RoomGrid.tsx
│       │   │       │   └── RoomForm.tsx
│       │   │       │
│       │   │       ├── waiters/
│       │   │       │   ├── WaiterCard.tsx
│       │   │       │   ├── WaiterForm.tsx
│       │   │       │   └── WaiterStats.tsx
│       │   │       │
│       │   │       └── analytics/
│       │   │           ├── RevenueChart.tsx
│       │   │           ├── TopItemsChart.tsx
│       │   │           ├── StatsCard.tsx
│       │   │           └── WaiterPerformance.tsx
│       │   │
│       │   ├── pages/
│       │   │   ├── auth/
│       │   │   │   ├── LoginPage.tsx
│       │   │   │   └── WaiterLoginPage.tsx
│       │   │   │
│       │   │   ├── admin/
│       │   │   │   ├── DashboardPage.tsx
│       │   │   │   ├── MenuPage.tsx
│       │   │   │   ├── RoomsPage.tsx
│       │   │   │   ├── WaitersPage.tsx
│       │   │   │   ├── OrdersPage.tsx
│       │   │   │   ├── AnalyticsPage.tsx
│       │   │   │   └── SettingsPage.tsx
│       │   │   │
│       │   │   ├── waiter/
│       │   │   │   ├── RoomSelectionPage.tsx
│       │   │   │   ├── OrderPage.tsx
│       │   │   │   └── MyStatsPage.tsx
│       │   │   │
│       │   │   └── super-admin/
│       │   │       ├── LoginPage.tsx
│       │   │       ├── DashboardPage.tsx
│       │   │       ├── RestaurantsPage.tsx
│       │   │       └── CreateRestaurantPage.tsx
│       │   │
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useOnlineStatus.ts
│       │   │   ├── useSync.ts
│       │   │   ├── useOrders.ts
│       │   │   ├── useMenuItems.ts
│       │   │   └── useToast.ts
│       │   │
│       │   ├── stores/
│       │   │   ├── authStore.ts
│       │   │   ├── orderStore.ts
│       │   │   ├── syncStore.ts
│       │   │   └── uiStore.ts
│       │   │
│       │   ├── services/
│       │   │   ├── api.ts
│       │   │   ├── db.ts              # IndexedDB (Dexie)
│       │   │   ├── sync.ts
│       │   │   └── offline.ts
│       │   │
│       │   ├── utils/
│       │   │   └── format.ts
│       │   │
│       │   ├── App.tsx
│       │   ├── Router.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       │
│       ├── .env.example
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── postcss.config.js
│
├── packages/
│   ├── types/
│   │   ├── src/
│   │   │   ├── models/
│   │   │   │   ├── restaurant.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── menuItem.ts
│   │   │   │   ├── room.ts
│   │   │   │   ├── order.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── requests.ts
│   │   │   │   ├── responses.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── validation/
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── menuItem.ts
│   │   │   │   ├── room.ts
│   │   │   │   ├── waiter.ts
│   │   │   │   ├── order.ts
│   │   │   │   └── restaurant.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── constants/
│   │   ├── src/
│   │   │   ├── categories.ts
│   │   │   ├── orderStatus.ts
│   │   │   ├── roles.ts
│   │   │   ├── defaults.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/
│   │   ├── src/
│   │   │   ├── currency.ts
│   │   │   ├── date.ts
│   │   │   ├── phone.ts
│   │   │   ├── slug.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   └── index.ts
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tailwind.config.js
│   │
│   ├── eslint-config/
│   │   ├── base.js
│   │   ├── react.js
│   │   ├── node.js
│   │   └── package.json
│   │
│   └── tsconfig/
│       ├── base.json
│       ├── react.json
│       ├── node.json
│       └── package.json
│
├── .env.example
├── .gitignore
├── .npmrc
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
└── README.md
```

---

## SECTION 12 — FRONTEND PAGE STRUCTURE

### Route Configuration

```typescript
// apps/web/src/Router.tsx

const routes = [
  // Public routes
  { path: '/login', element: <LoginPage />, public: true },
  { path: '/waiter/login', element: <WaiterLoginPage />, public: true },
  { path: '/super-admin/login', element: <SuperAdminLoginPage />, public: true },

  // Waiter routes (mobile-first)
  {
    path: '/waiter',
    element: <WaiterLayout />,
    roles: ['waiter'],
    children: [
      { path: 'rooms', element: <RoomSelectionPage /> },
      { path: 'rooms/:roomId', element: <OrderPage /> },
      { path: 'stats', element: <MyStatsPage /> },
    ]
  },

  // Admin routes (dashboard)
  {
    path: '/admin',
    element: <AdminLayout />,
    roles: ['admin'],
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'rooms', element: <RoomsPage /> },
      { path: 'waiters', element: <WaitersPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ]
  },

  // Super admin routes
  {
    path: '/super-admin',
    element: <SuperAdminLayout />,
    roles: ['superAdmin'],
    children: [
      { path: 'dashboard', element: <SuperDashboardPage /> },
      { path: 'restaurants', element: <RestaurantsPage /> },
      { path: 'restaurants/new', element: <CreateRestaurantPage /> },
      { path: 'restaurants/:id', element: <RestaurantDetailPage /> },
    ]
  },
];
```

### Page Wireframes

#### Waiter: Room Selection

```
┌─────────────────────────────────────────────────────────┐
│  ● Offline                    OshxonaPOS     [Akmal]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Xonalarni tanlang                                     │
│                                                          │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│   │           │  │           │  │           │          │
│   │  Room 1   │  │  Room 2   │  │  Room 3   │          │
│   │   Empty   │  │ 145,000   │  │  85,000   │          │
│   │           │  │           │  │  (mine)   │          │
│   └───────────┘  └───────────┘  └───────────┘          │
│                                                          │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│   │           │  │           │  │           │          │
│   │  Room 4   │  │  Room 5   │  │  Room 6   │          │
│   │   Empty   │  │  Empty    │  │  92,000   │          │
│   │           │  │           │  │           │          │
│   └───────────┘  └───────────┘  └───────────┘          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  [Rooms]          [My Stats]          [Logout]          │
└─────────────────────────────────────────────────────────┘
```

#### Waiter: Order Screen

```
┌─────────────────────────────────────────────────────────┐
│  [← Back]          Room 3                    [Sync]     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Food]  [Drinks]  [Service]                            │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ┌────────┐                                      │   │
│  │  │  img   │   Osh                    ┌───┐      │   │
│  │  │        │   45,000 so'm           │ 2 │      │   │
│  │  └────────┘                    [-]  └───┘  [+]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ┌────────┐                                      │   │
│  │  │  img   │   Dimlama                 ┌───┐     │   │
│  │  │        │   55,000 so'm            │ 1 │     │   │
│  │  └────────┘                    [-]   └───┘  [+] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ┌────────┐                                      │   │
│  │  │  img   │   Non                     ┌───┐     │   │
│  │  │        │   3,000 so'm             │ 4 │     │   │
│  │  └────────┘                    [-]   └───┘  [+] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Jami:               157,000 so'm                      │
│   Sizning ulushingiz:  15,700 so'm (10%)               │
│                                                          │
│   [  Tozalash  ]         [  Buyurtmani Yopish  ]        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Admin: Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  Menu                         OshxonaPOS                  [Logout]  │
├─────────────────────────────────────────────────────────────────────┤
│  │                                                                   │
│  │ Dashboard                                                         │
│  │ Menu                                                              │
│  │ Rooms        ┌─────────────────────────────────────────────────┐ │
│  │ Waiters      │                                                  │ │
│  │ Orders       │   ┌──────────┐ ┌──────────┐ ┌──────────┐       │ │
│  │ Analytics    │   │ Today    │ │ Orders   │ │ Avg      │       │ │
│  │ Settings     │   │1,250,000 │ │    23    │ │  54,347  │       │ │
│  │              │   │   so'm   │ │          │ │   so'm   │       │ │
│  │              │   └──────────┘ └──────────┘ └──────────┘       │ │
│  │              │                                                  │ │
│  │              │   Revenue (This Week)                           │ │
│  │              │   ┌─────────────────────────────────────────┐  │ │
│  │              │   │     #                                    │  │ │
│  │              │   │  #  #  #     #                          │  │ │
│  │              │   │  #  #  #  #  #  #                       │  │ │
│  │              │   │  #  #  #  #  #  #  #                    │  │ │
│  │              │   │ Mon Tue Wed Thu Fri Sat Sun             │  │ │
│  │              │   └─────────────────────────────────────────┘  │ │
│  │              │                                                  │ │
│  │              │   Top Items              Open Orders             │ │
│  │              │   ┌────────────────┐    ┌────────────────┐     │ │
│  │              │   │ 1. Osh (42)    │    │ Room 2 - 145k │     │ │
│  │              │   │ 2. Dimlama (28)│    │ Room 3 - 85k  │     │ │
│  │              │   │ 3. Non (67)    │    │ Room 6 - 92k  │     │ │
│  │              │   └────────────────┘    └────────────────┘     │ │
│  │              │                                                  │ │
│  │              └─────────────────────────────────────────────────┘ │
│  │                                                                   │
└──┴───────────────────────────────────────────────────────────────────┘
```

---

## SECTION 13 — OFFLINE ARCHITECTURE

### IndexedDB Schema (Dexie)

```typescript
// apps/web/src/services/db.ts

import Dexie, { Table } from 'dexie';

export interface LocalMenuItem {
  _id: string;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'service';
  image: string;
  sortOrder: number;
  isActive: boolean;
}

export interface LocalRoom {
  _id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  currentOrderId: string | null;
}

export interface LocalOrder {
  _id?: string;              // Server ID (null if not synced)
  clientId: string;          // Client-generated UUID
  roomId: string;
  waiterId: string;
  items: LocalOrderItem[];
  totalPrice: number;
  waiterCommission: {
    percent: number;
    amount: number;
  };
  status: 'open' | 'closed' | 'cancelled';
  openedAt: string;
  closedAt: string | null;
  syncStatus: 'synced' | 'pending' | 'conflict';
  updatedAt: string;
}

export interface LocalOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'CLOSE_ORDER';
  payload: object;
  clientId: string;
  createdAt: number;
  attempts: number;
  status: 'pending' | 'syncing' | 'failed';
}

export interface SyncMetadata {
  key: string;
  value: string | number;
}

class OshxonaDB extends Dexie {
  menuItems!: Table<LocalMenuItem>;
  rooms!: Table<LocalRoom>;
  orders!: Table<LocalOrder>;
  syncQueue!: Table<SyncQueueItem>;
  metadata!: Table<SyncMetadata>;

  constructor() {
    super('oshxona-pos');

    this.version(1).stores({
      menuItems: '_id, category, isActive, sortOrder',
      rooms: '_id, isActive, sortOrder',
      orders: '_id, clientId, roomId, waiterId, status, syncStatus, updatedAt',
      syncQueue: 'id, status, createdAt',
      metadata: 'key',
    });
  }
}

export const db = new OshxonaDB();
```

### Service Worker Strategy

```typescript
// apps/web/public/sw.js

const CACHE_NAME = 'oshxona-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests: Network only (handled by IndexedDB)
  if (request.url.includes('/api/')) return;

  // Static assets: Cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone);
        });
        return response;
      });

      return cached || fetched;
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // Handled by main app through postMessage
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_ORDERS' });
  });
}
```

### Sync Manager

```typescript
// apps/web/src/services/sync.ts

import { db, LocalOrder, SyncQueueItem } from './db';
import { api } from './api';
import { v4 as uuid } from 'uuid';

class SyncManager {
  private syncing = false;

  // Add operation to queue
  async queueOperation(
    type: SyncQueueItem['type'],
    payload: object,
    clientId: string
  ) {
    await db.syncQueue.add({
      id: uuid(),
      type,
      payload,
      clientId,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending',
    });

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.sync();
    }
  }

  // Process sync queue
  async sync() {
    if (this.syncing) return;
    this.syncing = true;

    try {
      const pending = await db.syncQueue
        .where('status')
        .equals('pending')
        .sortBy('createdAt');

      for (const item of pending) {
        await this.processItem(item);
      }
    } finally {
      this.syncing = false;
    }
  }

  private async processItem(item: SyncQueueItem) {
    try {
      await db.syncQueue.update(item.id, { status: 'syncing' });

      let response;
      switch (item.type) {
        case 'CREATE_ORDER':
          response = await api.post('/orders', item.payload);
          break;
        case 'UPDATE_ORDER':
          response = await api.patch(`/orders/${item.payload.clientId}`, item.payload);
          break;
        case 'CLOSE_ORDER':
          response = await api.post(`/orders/${item.payload.clientId}/close`);
          break;
      }

      // Update local order with server data
      if (response.data) {
        await db.orders.where('clientId').equals(item.clientId).modify({
          _id: response.data._id,
          syncStatus: 'synced',
        });
      }

      // Remove from queue
      await db.syncQueue.delete(item.id);

    } catch (error) {
      const attempts = item.attempts + 1;

      if (attempts >= 5) {
        await db.syncQueue.update(item.id, {
          status: 'failed',
          attempts,
        });
      } else {
        await db.syncQueue.update(item.id, {
          status: 'pending',
          attempts,
        });
      }
    }
  }

  // Pull latest data from server
  async pullData() {
    const lastSync = await db.metadata.get('lastSyncAt');

    const response = await api.get('/sync/pull', {
      params: { lastSyncAt: lastSync?.value || 0 },
    });

    const { menuItems, rooms, orders, timestamp } = response.data;

    // Update local data
    await db.transaction('rw', [db.menuItems, db.rooms, db.orders, db.metadata], async () => {
      if (menuItems.length) {
        await db.menuItems.bulkPut(menuItems);
      }
      if (rooms.length) {
        await db.rooms.bulkPut(rooms);
      }
      if (orders.length) {
        for (const order of orders) {
          const local = await db.orders.where('clientId').equals(order.clientId).first();
          if (!local || new Date(order.updatedAt) > new Date(local.updatedAt)) {
            await db.orders.put({ ...order, syncStatus: 'synced' });
          }
        }
      }
      await db.metadata.put({ key: 'lastSyncAt', value: timestamp });
    });
  }
}

export const syncManager = new SyncManager();
```

### Offline Order Operations

```typescript
// apps/web/src/services/offline.ts

import { db, LocalOrder, LocalOrderItem } from './db';
import { syncManager } from './sync';
import { v4 as uuid } from 'uuid';

export async function createOrder(roomId: string, waiterId: string, commission: number): Promise<LocalOrder> {
  const clientId = uuid();

  const order: LocalOrder = {
    clientId,
    roomId,
    waiterId,
    items: [],
    totalPrice: 0,
    waiterCommission: {
      percent: commission,
      amount: 0,
    },
    status: 'open',
    openedAt: new Date().toISOString(),
    closedAt: null,
    syncStatus: 'pending',
    updatedAt: new Date().toISOString(),
  };

  await db.orders.add(order);

  // Update room
  await db.rooms.update(roomId, { currentOrderId: clientId });

  // Queue sync
  await syncManager.queueOperation('CREATE_ORDER', order, clientId);

  return order;
}

export async function addItemToOrder(
  clientId: string,
  menuItem: { _id: string; name: string; price: number }
) {
  const order = await db.orders.where('clientId').equals(clientId).first();
  if (!order) throw new Error('Order not found');

  const existingIndex = order.items.findIndex(i => i.menuItemId === menuItem._id);

  if (existingIndex >= 0) {
    order.items[existingIndex].quantity += 1;
    order.items[existingIndex].subtotal =
      order.items[existingIndex].price * order.items[existingIndex].quantity;
  } else {
    order.items.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      subtotal: menuItem.price,
    });
  }

  order.totalPrice = order.items.reduce((sum, i) => sum + i.subtotal, 0);
  order.waiterCommission.amount = Math.floor(
    order.totalPrice * (order.waiterCommission.percent / 100)
  );
  order.updatedAt = new Date().toISOString();
  order.syncStatus = 'pending';

  await db.orders.put(order);
  await syncManager.queueOperation('UPDATE_ORDER', order, clientId);

  return order;
}

export async function removeItemFromOrder(clientId: string, menuItemId: string) {
  const order = await db.orders.where('clientId').equals(clientId).first();
  if (!order) throw new Error('Order not found');

  const existingIndex = order.items.findIndex(i => i.menuItemId === menuItemId);

  if (existingIndex >= 0) {
    if (order.items[existingIndex].quantity > 1) {
      order.items[existingIndex].quantity -= 1;
      order.items[existingIndex].subtotal =
        order.items[existingIndex].price * order.items[existingIndex].quantity;
    } else {
      order.items.splice(existingIndex, 1);
    }
  }

  order.totalPrice = order.items.reduce((sum, i) => sum + i.subtotal, 0);
  order.waiterCommission.amount = Math.floor(
    order.totalPrice * (order.waiterCommission.percent / 100)
  );
  order.updatedAt = new Date().toISOString();
  order.syncStatus = 'pending';

  await db.orders.put(order);
  await syncManager.queueOperation('UPDATE_ORDER', order, clientId);

  return order;
}

export async function closeOrder(clientId: string) {
  const order = await db.orders.where('clientId').equals(clientId).first();
  if (!order) throw new Error('Order not found');

  order.status = 'closed';
  order.closedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();
  order.syncStatus = 'pending';

  await db.orders.put(order);
  await db.rooms.update(order.roomId, { currentOrderId: null });
  await syncManager.queueOperation('CLOSE_ORDER', { clientId }, clientId);

  return order;
}
```

---

## SECTION 14 — ANALYTICS LOGIC

### Daily Aggregation Job

```typescript
// apps/api/src/jobs/aggregateAnalytics.ts

import cron from 'node-cron';
import { Order, MenuItem, User, DailyAnalytics } from '../models';
import { startOfDay, endOfDay, subDays } from 'date-fns';

// Run at 1 AM every day
cron.schedule('0 1 * * *', async () => {
  await aggregateYesterday();
});

async function aggregateYesterday() {
  const yesterday = subDays(new Date(), 1);
  const start = startOfDay(yesterday);
  const end = endOfDay(yesterday);

  // Get all restaurants with orders yesterday
  const restaurantIds = await Order.distinct('restaurantId', {
    closedAt: { $gte: start, $lte: end },
    status: 'closed',
  });

  for (const restaurantId of restaurantIds) {
    await aggregateForRestaurant(restaurantId, start, end);
  }
}

async function aggregateForRestaurant(restaurantId: string, start: Date, end: Date) {
  const orders = await Order.find({
    restaurantId,
    closedAt: { $gte: start, $lte: end },
    status: 'closed',
  });

  if (orders.length === 0) return;

  // Calculate totals
  const revenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const orderCount = orders.length;
  const avgOrderValue = Math.round(revenue / orderCount);

  // By category
  const byCategory = {
    food: { revenue: 0, quantity: 0 },
    drink: { revenue: 0, quantity: 0 },
    service: { revenue: 0, quantity: 0 },
  };

  // Collect all items for top items calculation
  const itemMap = new Map();

  for (const order of orders) {
    for (const item of order.items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      const category = menuItem?.category || 'food';

      byCategory[category].revenue += item.subtotal;
      byCategory[category].quantity += item.quantity;

      const key = item.menuItemId.toString();
      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        itemMap.set(key, {
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          revenue: item.subtotal,
        });
      }
    }
  }

  // Top items (top 10)
  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // By waiter
  const waiterMap = new Map();

  for (const order of orders) {
    const key = order.waiterId.toString();
    if (waiterMap.has(key)) {
      const existing = waiterMap.get(key);
      existing.orderCount += 1;
      existing.revenue += order.totalPrice;
      existing.commission += order.waiterCommission.amount;
    } else {
      const waiter = await User.findById(order.waiterId);
      waiterMap.set(key, {
        waiterId: order.waiterId,
        name: waiter?.name || 'Unknown',
        orderCount: 1,
        revenue: order.totalPrice,
        commission: order.waiterCommission.amount,
      });
    }
  }

  const byWaiter = Array.from(waiterMap.values());

  // By hour
  const byHour = Array(24).fill(null).map((_, hour) => ({
    hour,
    orderCount: 0,
    revenue: 0,
  }));

  for (const order of orders) {
    const hour = new Date(order.closedAt).getHours();
    byHour[hour].orderCount += 1;
    byHour[hour].revenue += order.totalPrice;
  }

  // Upsert analytics document
  await DailyAnalytics.findOneAndUpdate(
    { restaurantId, date: start },
    {
      totals: { revenue, orderCount, avgOrderValue },
      byCategory,
      topItems,
      byWaiter,
      byHour,
    },
    { upsert: true }
  );
}
```

### Real-time Dashboard Queries

```typescript
// apps/api/src/services/analytics.service.ts

import { ObjectId } from 'mongoose';
import { startOfDay, subDays } from 'date-fns';
import { Order, DailyAnalytics } from '../models';

export async function getDashboardStats(restaurantId: string) {
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));
  const weekAgo = startOfDay(subDays(new Date(), 7));

  // Today's stats (real-time from orders)
  const todayStats = await Order.aggregate([
    {
      $match: {
        restaurantId: new ObjectId(restaurantId),
        status: 'closed',
        closedAt: { $gte: today },
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalPrice' },
        orderCount: { $sum: 1 },
      }
    }
  ]);

  // Yesterday from pre-aggregated
  const yesterdayAnalytics = await DailyAnalytics.findOne({
    restaurantId,
    date: yesterday,
  });

  // This week (aggregated + today)
  const weekAnalytics = await DailyAnalytics.aggregate([
    {
      $match: {
        restaurantId: new ObjectId(restaurantId),
        date: { $gte: weekAgo, $lt: today },
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totals.revenue' },
        orderCount: { $sum: '$totals.orderCount' },
      }
    }
  ]);

  return {
    today: {
      revenue: todayStats[0]?.revenue || 0,
      orderCount: todayStats[0]?.orderCount || 0,
      avgOrderValue: todayStats[0]?.orderCount
        ? Math.round(todayStats[0].revenue / todayStats[0].orderCount)
        : 0,
    },
    yesterday: {
      revenue: yesterdayAnalytics?.totals.revenue || 0,
      orderCount: yesterdayAnalytics?.totals.orderCount || 0,
      avgOrderValue: yesterdayAnalytics?.totals.avgOrderValue || 0,
    },
    thisWeek: {
      revenue: (weekAnalytics[0]?.revenue || 0) + (todayStats[0]?.revenue || 0),
      orderCount: (weekAnalytics[0]?.orderCount || 0) + (todayStats[0]?.orderCount || 0),
    },
  };
}
```

---

## SECTION 15 — VALIDATION RULES

### Validation Schemas (Zod)

```typescript
// packages/validation/src/schemas/auth.ts

import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string()
    .regex(/^\+998[0-9]{9}$/, 'Phone must be valid Uzbek number (+998XXXXXXXXX)'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});
```

```typescript
// packages/validation/src/schemas/menuItem.ts

import { z } from 'zod';
import { CATEGORIES } from '@repo/constants';

export const createMenuItemSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long'),
  price: z.number()
    .int('Price must be whole number')
    .min(0, 'Price cannot be negative')
    .max(100_000_000, 'Price too high'),
  category: z.enum(CATEGORIES),
  image: z.string().url().optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
```

```typescript
// packages/validation/src/schemas/order.ts

import { z } from 'zod';

export const createOrderSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid room ID'),
  items: z.array(z.object({
    menuItemId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    quantity: z.number().int().min(1).max(999),
  })).optional().default([]),
  clientId: z.string().uuid().optional(),
});

export const updateOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    quantity: z.number().int().min(0).max(999),
  })),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(500),
});
```

```typescript
// packages/validation/src/schemas/waiter.ts

import { z } from 'zod';

export const createWaiterSchema = z.object({
  name: z.string()
    .min(2, 'Name too short')
    .max(50, 'Name too long'),
  phone: z.string()
    .regex(/^\+998[0-9]{9}$/, 'Invalid phone number'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  commissionPercent: z.number()
    .min(0, 'Commission cannot be negative')
    .max(100, 'Commission cannot exceed 100%')
    .optional()
    .default(0),
});

export const updateWaiterSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^\+998[0-9]{9}$/).optional(),
  password: z.string().min(6).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});
```

```typescript
// packages/validation/src/schemas/restaurant.ts

import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  phone: z.string().regex(/^\+998[0-9]{9}$/),
  address: z.string().max(200).optional(),

  adminName: z.string().min(2).max(50),
  adminPhone: z.string().regex(/^\+998[0-9]{9}$/),
  adminPassword: z.string().min(6),

  plan: z.enum(['trial', 'basic', 'premium']),

  commissionEnabled: z.boolean().optional().default(false),
  defaultCommission: z.number().min(0).max(100).optional().default(10),

  createSampleData: z.boolean().optional().default(true),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+998[0-9]{9}$/).optional(),
  address: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
  settings: z.object({
    commissionEnabled: z.boolean().optional(),
    defaultCommission: z.number().min(0).max(100).optional(),
  }).optional(),
});
```

---

## SECTION 16 — EDGE CASES

### Order Edge Cases

| Scenario | Handling |
|----------|----------|
| Waiter adds item that was deactivated | Check `isActive` before adding. If item was in order before deactivation, allow keeping but not adding more |
| Room already has open order | Check `currentOrderId` on room. If exists and not by current waiter, show "Room occupied" message |
| Menu item price changed mid-order | Order stores item price at time of adding (denormalized). Changes don't affect existing orders |
| Waiter tries to close empty order | Validate `items.length > 0` before closing |
| Concurrent order updates | Use `updatedAt` timestamp. Latest write wins. Client refreshes on conflict |
| Order sync fails repeatedly | After 5 attempts, mark as `failed`. Show in admin dashboard for manual resolution |

### Offline Edge Cases

| Scenario | Handling |
|----------|----------|
| User opens same room on two devices | Each creates local order. On sync, server detects duplicate `roomId` with `status: open`. Merge items, keep higher quantities |
| App closed while offline with pending syncs | Service Worker persists sync queue. On next app open, queue is processed |
| Token expires while offline | Store refresh token. On sync attempt, if 401, try refresh. If refresh fails, redirect to login |
| IndexedDB quota exceeded | Implement cleanup: remove orders older than 30 days. Show warning at 80% capacity |
| Menu items updated while waiter offline | On next sync, pull latest menu. Items in pending orders use denormalized data, so work correctly |

### Authentication Edge Cases

| Scenario | Handling |
|----------|----------|
| Admin deactivates waiter mid-shift | Waiter can complete current order. On next API call, receive 403. Local app shows "Account deactivated" |
| Same phone used for multiple restaurants | Not allowed. Phone is unique per restaurant (compound index). Different restaurants can have same phone |
| Password reset flow | Admin resets via dashboard. Waiter must login with new password. Old sessions invalidated |
| Super admin deletes restaurant | Soft delete (`isActive: false`). Data preserved for 90 days, then hard delete |

### Data Integrity Edge Cases

| Scenario | Handling |
|----------|----------|
| Menu item deleted with existing orders | Soft delete (`isActive: false`). Historical orders preserve denormalized item data |
| Room deleted with open order | Prevent deletion if `currentOrderId` exists. Must close/cancel order first |
| Analytics aggregation fails | Retry 3 times with exponential backoff. Alert super admin on persistent failure |
| Cloudinary upload fails | Return error to client. Use default image. Don't block menu item creation |

---

## SECTION 17 — MVP DEVELOPMENT ORDER

### Phase 1: Foundation (Week 1)

```
1.1 Monorepo Setup
    ├── Initialize pnpm workspace
    ├── Configure turborepo
    ├── Setup base tsconfig
    ├── Setup ESLint config
    └── Create package structure

1.2 Shared Packages
    ├── @repo/types (all TypeScript interfaces)
    ├── @repo/constants (categories, statuses, defaults)
    ├── @repo/validation (Zod schemas)
    └── @repo/utils (currency, date, phone formatters)

1.3 Database Setup
    ├── MongoDB Atlas cluster
    ├── Mongoose connection
    ├── All model schemas
    └── Index definitions
```

### Phase 2: Backend Core (Week 2)

```
2.1 API Foundation
    ├── Express app setup
    ├── Middleware (cors, helmet, compression)
    ├── Error handling
    └── Request validation

2.2 Authentication
    ├── JWT implementation
    ├── Login endpoints (admin, waiter, super admin)
    ├── Auth middleware
    └── Password hashing

2.3 Multi-tenant
    ├── Tenant middleware
    ├── restaurantId injection
    └── Query scoping

2.4 Core CRUD APIs
    ├── Menu items API
    ├── Rooms API
    ├── Waiters API
    └── Restaurant API
```

### Phase 3: Order System (Week 3)

```
3.1 Order API
    ├── Create order
    ├── Update order (add/remove items)
    ├── Close order
    ├── Cancel order
    └── Get orders (with filters)

3.2 Sync API
    ├── Push endpoint (batch operations)
    ├── Pull endpoint (delta sync)
    ├── Conflict resolution
    └── Client ID handling

3.3 Image Upload
    ├── Cloudinary config
    ├── Upload endpoint
    └── Default image assignment
```

### Phase 4: Frontend Foundation (Week 4)

```
4.1 Web App Setup
    ├── Vite + React
    ├── TailwindCSS
    ├── React Router
    └── Zustand stores

4.2 PWA Setup
    ├── Service Worker
    ├── Manifest
    ├── IndexedDB (Dexie)
    └── Offline detection

4.3 Auth UI
    ├── Login page
    ├── Waiter login page
    ├── Auth context
    └── Protected routes
```

### Phase 5: Waiter Interface (Week 5)

```
5.1 Room Selection
    ├── Room grid component
    ├── Room status indicators
    ├── Auto-refresh
    └── Offline support

5.2 Order Screen
    ├── Category tabs
    ├── Menu item cards
    ├── +/- quantity controls
    ├── Sticky order summary
    └── Close/clear order modals

5.3 Offline Orders
    ├── Local order creation
    ├── Sync queue
    ├── Background sync
    └── Conflict handling
```

### Phase 6: Admin Dashboard (Week 6)

```
6.1 Layout
    ├── Sidebar navigation
    ├── Header with user info
    └── Responsive design

6.2 Management Pages
    ├── Menu management (CRUD + reorder)
    ├── Room management
    ├── Waiter management
    └── Settings page

6.3 Orders Page
    ├── Order list with filters
    ├── Order detail modal
    └── Cancel order flow
```

### Phase 7: Analytics & Super Admin (Week 7)

```
7.1 Analytics
    ├── Daily aggregation job
    ├── Dashboard API
    ├── Dashboard page
    └── Charts (recharts)

7.2 Super Admin
    ├── Super admin login
    ├── Restaurant list
    ├── Create restaurant wizard
    └── Platform stats

7.3 Polish
    ├── Loading states
    ├── Error states
    ├── Empty states
    └── Animations
```

### Phase 8: Testing & Deploy (Week 8)

```
8.1 Testing
    ├── API integration tests
    ├── Critical path E2E tests
    └── Offline mode testing

8.2 Deployment
    ├── Railway/Render for API
    ├── Vercel/Netlify for web
    ├── MongoDB Atlas (free tier)
    ├── Cloudinary (free tier)
    └── Domain setup

8.3 Launch Prep
    ├── Create demo restaurant
    ├── Documentation
    └── Monitoring setup
```

---

## SECTION 18 — CODE GENERATION PLAN

### Priority 1: Core Infrastructure

```
File                                    Purpose
────────────────────────────────────────────────────────────
pnpm-workspace.yaml                     Workspace config
turbo.json                              Build pipeline
package.json (root)                     Scripts, devDeps
.npmrc                                  pnpm settings
.gitignore                              Ignore patterns

packages/tsconfig/base.json             Base TS config
packages/tsconfig/react.json            React TS config
packages/tsconfig/node.json             Node TS config

packages/eslint-config/base.js          Base ESLint
packages/eslint-config/react.js         React ESLint
```

### Priority 2: Shared Types

```
File                                    Purpose
────────────────────────────────────────────────────────────
packages/types/src/models/restaurant.ts Restaurant interface
packages/types/src/models/user.ts       User interface
packages/types/src/models/menuItem.ts   MenuItem interface
packages/types/src/models/room.ts       Room interface
packages/types/src/models/order.ts      Order interface
packages/types/src/api/requests.ts      API request types
packages/types/src/api/responses.ts     API response types
```

### Priority 3: Constants & Validation

```
File                                    Purpose
────────────────────────────────────────────────────────────
packages/constants/src/categories.ts    Food categories
packages/constants/src/orderStatus.ts   Order statuses
packages/constants/src/roles.ts         User roles
packages/constants/src/defaults.ts      Default values

packages/validation/src/schemas/*.ts    All Zod schemas
```

### Priority 4: Backend

```
File                                    Purpose
────────────────────────────────────────────────────────────
apps/api/src/server.ts                  Entry point
apps/api/src/app.ts                     Express app
apps/api/src/config/database.ts         MongoDB connection
apps/api/src/middleware/auth.ts         JWT middleware
apps/api/src/middleware/tenant.ts       Tenant scoping
apps/api/src/models/*.ts                Mongoose models
apps/api/src/routes/*.ts                Route handlers
apps/api/src/services/*.ts              Business logic
```

### Priority 5: Frontend Core

```
File                                    Purpose
────────────────────────────────────────────────────────────
apps/web/src/main.tsx                   Entry point
apps/web/src/App.tsx                    Root component
apps/web/src/Router.tsx                 Route config
apps/web/src/services/api.ts            Axios instance
apps/web/src/services/db.ts             Dexie database
apps/web/src/stores/authStore.ts        Auth state
apps/web/public/sw.js                   Service Worker
apps/web/public/manifest.json           PWA manifest
```

### Priority 6: Frontend Pages

```
File                                    Purpose
────────────────────────────────────────────────────────────
apps/web/src/pages/auth/LoginPage.tsx           Admin login
apps/web/src/pages/auth/WaiterLoginPage.tsx     Waiter login
apps/web/src/pages/waiter/RoomSelectionPage.tsx Room grid
apps/web/src/pages/waiter/OrderPage.tsx         Order screen
apps/web/src/pages/admin/DashboardPage.tsx      Dashboard
apps/web/src/pages/admin/MenuPage.tsx           Menu CRUD
apps/web/src/pages/admin/RoomsPage.tsx          Room CRUD
apps/web/src/pages/admin/WaitersPage.tsx        Waiter CRUD
apps/web/src/pages/admin/OrdersPage.tsx         Order history
apps/web/src/pages/admin/AnalyticsPage.tsx      Reports
```

---

## SECTION 19 — PACKAGE DEPENDENCIES

### Root package.json

```json
{
  "name": "oshxona-pos",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### apps/api/package.json

```json
{
  "name": "@oshxona/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src/",
    "test": "vitest"
  },
  "dependencies": {
    "@repo/constants": "workspace:*",
    "@repo/types": "workspace:*",
    "@repo/utils": "workspace:*",
    "@repo/validation": "workspace:*",

    "express": "^4.19.0",
    "mongoose": "^8.3.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^2.1.0",
    "node-cron": "^3.0.3",
    "date-fns": "^3.6.0",
    "zod": "^3.23.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@types/express": "^4.17.21",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.12.0",
    "@types/node-cron": "^3.0.11",
    "nodemon": "^3.1.0",
    "vitest": "^1.4.0",
    "supertest": "^7.0.0"
  }
}
```

### apps/web/package.json

```json
{
  "name": "@oshxona/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@repo/constants": "workspace:*",
    "@repo/types": "workspace:*",
    "@repo/utils": "workspace:*",
    "@repo/validation": "workspace:*",
    "@repo/ui": "workspace:*",

    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "dexie": "^4.0.0",
    "dexie-react-hooks": "^1.1.7",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.1.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/uuid": "^9.0.8",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.2.0",
    "vite-plugin-pwa": "^0.19.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.0"
  }
}
```

### packages/validation/package.json

```json
{
  "name": "@repo/validation",
  "version": "0.1.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@repo/constants": "workspace:*",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@repo/tsconfig": "workspace:*",
    "typescript": "^5.4.0"
  }
}
```

---

## SECTION 20 — ENVIRONMENT VARIABLES

### apps/api/.env.example

```bash
# Server
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oshxona?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Super Admin (initial setup)
SUPER_ADMIN_EMAIL=admin@oshxona.uz
SUPER_ADMIN_PASSWORD=initial-password-change-me

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Redis (for production session store)
# REDIS_URL=redis://localhost:6379

# Optional: SMS (for production)
# SMS_API_KEY=your-sms-provider-key
# SMS_SENDER_ID=OshxonaPOS

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### apps/web/.env.example

```bash
# API
VITE_API_URL=http://localhost:3001/api/v1

# App
VITE_APP_NAME=OshxonaPOS
VITE_APP_URL=http://localhost:5173

# PWA
VITE_PWA_NAME=OshxonaPOS
VITE_PWA_SHORT_NAME=Oshxona
VITE_PWA_DESCRIPTION=Restaurant order management system
```

### Production Environment Notes

```
MongoDB Atlas (Free Tier - M0)
├── 512 MB storage
├── Shared RAM
├── Sufficient for MVP

Cloudinary (Free Tier)
├── 25 GB storage
├── 25 GB bandwidth/month
├── Auto image optimization

Deployment Options:
├── Railway.app (API) - $5/month minimum
├── Render.com (API) - Free tier available
├── Vercel (Web) - Free tier
├── Netlify (Web) - Free tier

Estimated Monthly Cost (MVP):
├── MongoDB Atlas: $0 (free tier)
├── Cloudinary: $0 (free tier)
├── API hosting: $5-10
├── Domain: ~$12/year
└── Total: ~$5-10/month
```

---

## Summary

This architecture document provides a complete blueprint for building OshxonaPOS as a production-ready SaaS MVP. Key decisions:

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Monorepo** | pnpm + turborepo | Fast installs, intelligent caching |
| **Multi-tenant** | Single DB, query scoping | Simplest for MVP, easy to scale |
| **Offline** | IndexedDB + Service Worker | Works without internet |
| **Sync** | Queue-based with conflict resolution | Reliable data integrity |
| **Auth** | JWT with role-based access | Simple, stateless |
| **Analytics** | Pre-aggregated daily + real-time | Fast queries, low compute |
| **Infrastructure** | Free tiers + $5-10/mo | Minimal cost for validation |

The waiter interface prioritizes simplicity with large touch targets, minimal text input, and seamless offline operation. The architecture supports growth while keeping MVP scope tight and focused on solving the core paper-based ordering problem.
