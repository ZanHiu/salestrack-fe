import { apiClient } from './client';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'deactivate'
  | 'bulk_import'
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'password_change'
  | 'profile_update';

export type AuditResource =
  | 'sales-entry'
  | 'customer'
  | 'product'
  | 'category'
  | 'user'
  | 'auth';

export interface AuditChange {
  field: string;
  before?: unknown;
  after?: unknown;
}

export interface AuditEntry {
  _id: string;
  userId?: string;
  userFullName: string;
  userRole: 'admin' | 'staff' | 'unknown';
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  resourceLabel?: string;
  changes?: AuditChange[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ListAuditParams {
  userId?: string;
  resource?: AuditResource;
  action?: AuditAction;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export const auditApi = {
  async list(params: ListAuditParams = {}) {
    const res = await apiClient.get<{
      data: AuditEntry[];
      meta: { total: number; page: number; pageSize: number };
    }>('/audit', { params });
    return res.data;
  },
};
