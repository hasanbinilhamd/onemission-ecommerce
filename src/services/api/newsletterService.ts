export interface NewsletterSubscribeSuccessResponse {
  success: true;
  message: string;
}

export interface NewsletterSubscribeErrorResponse {
  success: false;
  message: string;
  code?: string;
}

export type NewsletterSubscribeResponse = NewsletterSubscribeSuccessResponse | NewsletterSubscribeErrorResponse;

export class NewsletterSubscribeError extends Error {
  statusCode: number;
  code: string;

  constructor({ message, statusCode, code }: { message: string; statusCode: number; code?: string }) {
    super(message);
    this.name = 'NewsletterSubscribeError';
    this.statusCode = statusCode;
    this.code = code || 'NEWSLETTER_SUBSCRIBE_FAILED';
  }
}

export async function subscribeNewsletter(email: string): Promise<NewsletterSubscribeSuccessResponse> {
  const response = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const payload = await response.json().catch(() => ({
    success: false,
    message: 'Something went wrong. Please try again later.',
  })) as NewsletterSubscribeResponse;

  if (!response.ok || payload.success === false) {
    throw new NewsletterSubscribeError({
      message: payload.message || 'Something went wrong. Please try again later.',
      statusCode: response.status || 500,
      code: payload.success === false ? payload.code : undefined,
    });
  }

  return payload;
}
