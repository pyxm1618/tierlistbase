import type { EmailSender } from "./email-sender";

export type ResendSendInput = {
  readonly from: string;
  readonly to: string[];
  readonly replyTo: string;
  readonly subject: string;
  readonly html: string;
};

export type ResendClientLike = {
  readonly emails: {
    send(
      input: ResendSendInput,
      options?: {
        readonly idempotencyKey?: string;
        readonly signal?: AbortSignal;
      },
    ): Promise<{
      readonly data: { readonly id: string } | null;
      readonly error: { readonly name?: string } | null;
    }>;
  };
};

export function createResendEmailSender(input: {
  readonly from: string;
  readonly replyTo: string;
  readonly client: ResendClientLike;
}): EmailSender {
  return {
    async send(message, options) {
      const payload = {
        from: input.from,
        to: [message.to],
        replyTo: input.replyTo,
        subject: message.subject,
        html: message.html,
      };
      const requestOptions = {
        ...(message.idempotencyKey ? { idempotencyKey: message.idempotencyKey } : {}),
        ...(options?.signal ? { signal: options.signal } : {}),
      };
      const result =
        Object.keys(requestOptions).length > 0
          ? await input.client.emails.send(payload, requestOptions)
          : await input.client.emails.send(payload);

      if (result.error || !result.data?.id) {
        throw new Error(`email delivery failed: ${result.error?.name ?? "unknown_error"}`);
      }

      return { providerMessageId: result.data.id };
    },
  };
}

export async function createProductionResendEmailSender(input: {
  readonly apiKey: string;
  readonly from: string;
  readonly replyTo: string;
}): Promise<EmailSender> {
  const { Resend } = await import("resend");
  const resend = new Resend(input.apiKey);
  return createResendEmailSender({
    from: input.from,
    replyTo: input.replyTo,
    client: {
      emails: {
        // Resend 6.18.1 forwards unknown request options into fetch RequestInit at runtime.
        // Keeping the local type explicit lets Vanguard bound provider I/O without upgrading dependencies.
        send: (message, options) => resend.emails.send(message, options),
      },
    },
  });
}
