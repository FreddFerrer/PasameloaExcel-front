export interface SupportSubmissionResponse {
  ticket_id: string;
  status: string;
  message: string;
  forwarded_channel: 'email' | 'backend_log_only' | string;
}
