export class ProductServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'PRODUCT_NOT_FOUND'
      | 'PRODUCT_NETWORK_ERROR'
      | 'PRODUCT_API_CONFIGURATION_MISSING'
      | 'PRODUCT_API_ERROR',
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

export function isProductNotFoundError(error: unknown): boolean {
  return error instanceof ProductServiceError && error.code === 'PRODUCT_NOT_FOUND';
}

export function isProductNetworkError(error: unknown): boolean {
  return error instanceof ProductServiceError
    && (error.code === 'PRODUCT_NETWORK_ERROR' || error.code === 'PRODUCT_API_ERROR');
}
