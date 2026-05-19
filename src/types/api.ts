export interface ApiSuccess<T> {
  data: T;
  meta?: { total?: number; page?: number; pageSize?: number };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
