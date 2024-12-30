```typescript
export class StripeError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'StripeError';
  }
}
```