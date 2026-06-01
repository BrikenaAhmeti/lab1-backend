import request from 'supertest';
import { createApp } from '../../src/app';
import { env } from '../../src/config/env';

describe('CORS', () => {
    const originalCorsAllowedOrigins = [...env.corsAllowedOrigins];
    const app = createApp();

    beforeAll(() => {
        env.nodeEnv = 'test';
        env.corsAllowedOrigins = [
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];
    });

    afterAll(() => {
        env.corsAllowedOrigins = originalCorsAllowedOrigins;
    });

    it.each([
        'http://localhost:3001',
        'http://localhost:3000',
    ])('allows requests from %s', async (origin) => {
        const response = await request(app)
            .get('/health')
            .set('Origin', origin);

        expect(response.status).toBe(200);
        expect(response.headers['access-control-allow-origin']).toBe(origin);
        expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
});
