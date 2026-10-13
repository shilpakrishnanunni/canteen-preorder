// Maximum quantity of a single item in one order.
export const MAX_PER_ITEM = 5;

// How often (ms) the tracking page asks the backend for the latest status.
export const POLL_MS = 5000;

// Keep these keys aligned with the backend OrderStatus enum.
export const STATUS_FLOW = [
  {
    key: 'PLACED',
    title: 'Order placed',
    desc: 'We have received your order.',
    banner: 'Order received',
    sub: 'Waiting for the kitchen to accept your order.',
  },
  {
    key: 'ACCEPTED',
    title: 'Order confirmed',
    desc: 'The kitchen has accepted it.',
    banner: 'Order confirmed',
    sub: 'The kitchen is lining up your order.',
  },
  {
    key: 'PREPARING',
    title: 'Preparing',
    desc: 'Your items are being made fresh.',
    banner: 'Preparing your food',
    sub: 'Your food is on the stove. Hang tight.',
  },
  {
    key: 'READY',
    title: 'Ready for pickup',
    desc: 'Show your token at the counter.',
    banner: 'Ready for pickup!',
    sub: 'Show your token at the counter to collect.',
  },
  {
    key: 'COMPLETED',
    title: 'Collected',
    desc: 'Enjoy your food.',
    banner: 'Order collected',
    sub: 'Thank you! See you again.',
  },
];

// Statuses after which polling stops.
export const FINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'REJECTED'];
