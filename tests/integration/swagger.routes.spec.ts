import request from 'supertest';
import { createApp } from '../../src/app';

describe('Swagger routes', () => {
    const app = createApp();

    it('should expose Swagger UI at /api/docs', async () => {
        const response = await request(app).get('/api/docs');

        expect(response.status).toBe(301);
        expect(response.headers.location).toBe('/api/docs/');
    });

    it('should expose OpenAPI JSON at /api/docs.json', async () => {
        const response = await request(app).get('/api/docs.json');

        expect(response.status).toBe(200);
        expect(response.body.openapi).toBe('3.0.3');
        expect(response.body.paths['/api/patients']).toBeDefined();
        expect(response.body.paths['/api/auth/login']).toBeDefined();
    });
});
