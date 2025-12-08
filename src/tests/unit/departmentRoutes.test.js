const request = require('supertest');
const app = require('../../server');
const { Department } = require('../../models');

describe('Department Routes', () => {
  beforeEach(async () => {
    // Clean up before each test
    await Department.destroy({ where: {}, force: true });
  });

  afterEach(async () => {
    // Clean up after each test
    await Department.destroy({ where: {}, force: true });
  });

  describe('GET /api/departments', () => {
    it('should return empty array when no departments exist', async () => {
      const res = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return all active departments', async () => {
      const dept1 = await Department.create({
        name: 'Computer Science',
        code: 'CS',
        isActive: true
      });

      const dept2 = await Department.create({
        name: 'Electrical Engineering',
        code: 'EE',
        isActive: true
      });

      const res = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.some(d => d.code === 'CS')).toBe(true);
      expect(res.body.data.some(d => d.code === 'EE')).toBe(true);
    });

    it('should exclude inactive departments', async () => {
      await Department.create({
        name: 'Active Department',
        code: 'ACTIVE',
        isActive: true
      });

      await Department.create({
        name: 'Inactive Department',
        code: 'INACTIVE',
        isActive: false
      });

      const res = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].code).toBe('ACTIVE');
    });

    it('should return departments with correct attributes', async () => {
      await Department.create({
        name: 'Test Department',
        code: 'TEST',
        description: 'Test Description',
        isActive: true
      });

      const res = await request(app)
        .get('/api/departments')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('code');
      expect(res.body.data[0]).toHaveProperty('description');
      expect(res.body.data[0]).not.toHaveProperty('isActive');
    });

    it('should return departments ordered by name', async () => {
      await Department.create({
        name: 'Zebra Department',
        code: 'ZEBRA',
        isActive: true
      });

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
      expect(departments[0].name).toBe('Alpha Department');
      expect(departments[1].name).toBe('Beta Department');
      expect(departments[2].name).toBe('Zebra Department');
    });

    it('should handle database errors', async () => {
      // Mock Department.findAll to throw error
      const originalFindAll = Department.findAll;
      Department.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/departments')
        .expect(500);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();

      // Restore original method
      Department.findAll = originalFindAll;
    });
  });
});

