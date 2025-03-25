export type CustomerStatus = 'active' | 'blocked' | 'banned';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  statusChangedAt?: string;
  statusChangeReason?: string;
  joinedAt: string;
  lastLoginAt?: string;
}
