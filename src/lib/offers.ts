export type DiscountCode = {
  code: string;
  percent: number;
  minSubtotal: number;
  label: string;
  description: string;
};

export const discountCodes: DiscountCode[] = [
  {
    code: "RIAF10",
    percent: 10,
    minSubtotal: 0,
    label: "10% welcome offer",
    description: "10% off your order with code RIAF10.",
  },
  {
    code: "RIAF15",
    percent: 15,
    minSubtotal: 100,
    label: "15% off orders over SAR 100",
    description: "A limited offer on orders over SAR 100 with code RIAF15.",
  },
];

export const FEATURED_OFFER = discountCodes[1];

export function findDiscountCode(value: string) {
  const normalized = value.trim().toUpperCase();
  return discountCodes.find((entry) => entry.code === normalized) ?? null;
}

export function nextOfferDeadline() {
  const now = new Date();
  const deadline = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7;

  deadline.setDate(now.getDate() + daysUntilSunday);
  deadline.setHours(23, 59, 59, 999);

  if (deadline.getTime() <= now.getTime()) {
    deadline.setDate(deadline.getDate() + 7);
  }

  return deadline;
}
