import '@getcronit/pylon';

declare module '@getcronit/pylon' {
    interface Bindings {
        DB: D1Database;
        RATE_LIMITER: RateLimit;
        SEED_SECRET: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Variables {}
}
