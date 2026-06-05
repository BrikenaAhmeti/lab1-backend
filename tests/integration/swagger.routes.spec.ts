import request from 'supertest';
import { createApp } from '../../src/app';

const expectedDocumentedRoutes: Record<string, string[]> = {
    '/health': ['get'],
    '/api/auth/register': ['post'],
    '/api/auth/login': ['post'],
    '/api/auth/refresh': ['post'],
    '/api/auth/confirm-email': ['post'],
    '/api/auth/resend-confirmation-email': ['post'],
    '/api/auth/logout': ['post'],
    '/api/auth/change-password': ['post'],
    '/api/auth/logout-all': ['post'],
    '/api/auth/me': ['get', 'patch'],
    '/api/auth/users': ['get', 'post'],
    '/api/auth/users/receptionists': ['post'],
    '/api/auth/users/{id}': ['get', 'patch', 'delete'],
    '/api/auth/users/{id}/status': ['patch'],
    '/api/auth/users/{id}/password': ['patch'],
    '/api/auth/roles': ['get', 'post'],
    '/api/auth/roles/{roleId}': ['patch', 'delete'],
    '/api/auth/users/{userId}/roles': ['get', 'post', 'put'],
    '/api/auth/users/{userId}/roles/{roleId}': ['delete'],
    '/api/auth/users/{userId}/refresh-tokens': ['get', 'delete'],
    '/api/patients': ['get', 'post'],
    '/api/patients/{id}': ['get', 'put', 'delete'],
    '/api/departments': ['get', 'post'],
    '/api/departments/all': ['get'],
    '/api/departments/{id}': ['get', 'put', 'delete'],
    '/api/departments/{id}/doctors': ['get'],
    '/api/departments/{id}/rooms': ['get'],
    '/api/departments/{id}/nurses': ['get'],
    '/api/doctors': ['get', 'post'],
    '/api/doctors/{id}': ['get', 'put', 'delete'],
    '/api/doctors/{id}/status': ['patch'],
    '/api/nurses': ['get', 'post'],
    '/api/nurses/{id}': ['get', 'put', 'delete'],
    '/api/appointments': ['get', 'post'],
    '/api/appointments/today': ['get'],
    '/api/appointments/{id}': ['get', 'put', 'delete'],
    '/api/medical-records': ['get', 'post'],
    '/api/medical-records/{id}': ['get', 'put', 'delete'],
    '/api/medical-records/{id}/prescriptions': ['get'],
    '/api/prescriptions': ['get', 'post'],
    '/api/prescriptions/{id}': ['get', 'put', 'delete'],
    '/api/rooms': ['get', 'post'],
    '/api/rooms/available': ['get'],
    '/api/rooms/{id}': ['get', 'put', 'delete'],
    '/api/admissions': ['get', 'post'],
    '/api/admissions/active': ['get'],
    '/api/admissions/{id}': ['get'],
    '/api/admissions/{id}/discharge': ['put'],
    '/api/invoices': ['get', 'post'],
    '/api/invoices/stats': ['get'],
    '/api/invoices/{id}': ['get', 'put', 'delete'],
    '/api/invoices/{id}/pay': ['put'],
    '/api/dashboard/stats': ['get'],
    '/api/dashboard/rooms/available': ['get'],
    '/api/dashboard/appointments/today': ['get'],
    '/api/dashboard/admissions/active': ['get'],
};

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

        for (const [path, methods] of Object.entries(expectedDocumentedRoutes)) {
            expect(response.body.paths[path]).toBeDefined();

            for (const method of methods) {
                expect(response.body.paths[path][method]).toBeDefined();
            }
        }
    });
});
