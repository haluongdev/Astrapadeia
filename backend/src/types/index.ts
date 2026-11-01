export type UserRole = 'student' | 'qtnd' | 'qtv';
export type AccountStatus = 'pending' | 'active' | 'locked' | 'disabled' | 'anonymized';

export interface Account {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  grade: number | null;
  status: AccountStatus;
  password_hash?: string;
  failed_logins?: number;
  locked_until?: Date | string | null;
  lock_reason?: string | null;
  consent_terms_version?: string;
  consent_privacy_version?: string;
  consent_at?: Date | string;
  created_at?: Date | string;
  sid?: string;
}

export interface PublicAccount {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  grade: number | null;
  status: AccountStatus;
  role: UserRole;
}

export interface DatabaseHealthResult {
  connected: boolean;
  timestamp?: string;
  latencyMs?: number;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  uptimeSeconds: number;
  timestamp: string;
  env: string;
  database: DatabaseHealthResult;
}
