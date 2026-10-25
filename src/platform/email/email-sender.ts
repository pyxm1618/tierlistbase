export type TransactionalEmailTemplate =
  | "magic-link"
  | "account-deletion"
  | "security-notice"
  | "vanguard-report";

export type TransactionalEmail = {
  readonly idempotencyKey?: string;
  readonly to: string;
  readonly template: TransactionalEmailTemplate;
  readonly subject: string;
  readonly html: string;
};

export type EmailSendOptions = {
  readonly signal?: AbortSignal;
};

export type EmailSendResult = {
  readonly providerMessageId: string;
};

export interface EmailSender {
  send(message: TransactionalEmail, options?: EmailSendOptions): Promise<EmailSendResult>;
}
