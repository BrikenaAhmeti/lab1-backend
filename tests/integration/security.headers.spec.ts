import request from 'supertest';
import { createApp } from '../../src/app';

describe('security headers', () => {
    const app = createApp();

    it('sends a Content Security Policy header', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.headers['content-security-policy']).toContain(
            "default-src 'self'",
        );
    });
});
