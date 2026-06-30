export type ShippingServiceResource = 'provinces' | 'cities' | 'districts' | 'rates';

export class ShippingServiceError extends Error {
  resource: ShippingServiceResource;
  retryable: boolean;

  constructor(resource: ShippingServiceResource, message: string, retryable = true) {
    super(message);
    this.name = 'ShippingServiceError';
    this.resource = resource;
    this.retryable = retryable;
  }
}

export function getShippingServiceErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
