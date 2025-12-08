const request = require('supertest');
const app = require('../../server');
const { Department } = require('../../models');

describe('Department Endpoints Integration Tests', () => {
  let testDepartment;

  beforeEach(async () => {
    // Clean up and create test department
    await Department.destroy({ where: {}, force: true });
    testDepartment = await Department.create({
      name: 'Test Department',
      code: 'TEST',
      description: 'Test Department Description',
      isActive: true
    });
  });

  afterEach(async () => {
    await Department.destroy({ where: {}, force: true });
  });

  describe('GET /api/departments', () => {
    it('should get all active departments', async () => {
      const res = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('code');
    });

    it('should only return active departments', async () => {
      // Create inactive department
      await Department.create({
        name: 'Inactive Department',
        code: 'INACT',
        isActive: false
      });

      const res = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(res.body.success).toBe(true);
      const inactiveDept = res.body.data.find(d => d.code === 'INACT');
      expect(inactiveDept).toBeUndefined();
    });

    it('should return departments ordered by name', async () => {
      await Department.create({
        name: 'Alpha Department',
        code: 'ALPHA',
        isActive: true
      });

      await Department.create({
        name: 'Beta Department',
        code: 'BETA',
        isActive: true
      });

      const res = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(res.body.success).toBe(true);
      const departments = res.body.data;
      for (let i = 0; i < departments.length - 1; i++) {
        expect(departments[i].name.localeCompare(departments[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });
  });
});







