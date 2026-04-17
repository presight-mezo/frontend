export interface Market {
  id: string;
  marketId: string;
  groupId: string;
  question: string;
  deadline: string;
  mode: string;
  status: string;
  yesAmount: string | number;
  noAmount: string | number;
  yes_pool: string | number;
  no_pool: string | number;
}

export interface TroveData {
  userAddress: string;
  troveBalance: string;
  musdBalance: string;
  updatedAt: string;
  isDefault: boolean;
}

export interface YieldData {
  accrued: string;
}

export interface MandateData {
  limitPerMarket: string;
}

export interface Notification {
  id: string;
  marketId: string;
  question: string;
  type: string;
  createdAt: string;
}
