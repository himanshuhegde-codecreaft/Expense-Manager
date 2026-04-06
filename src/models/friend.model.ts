import type { Row } from '../core/storage/db.js';

export interface Friend extends Row {
  id: string;
  name: string;
  email: string | undefined;
  phone: string | undefined;
  balance: number;
  address?: string | undefined;
}
