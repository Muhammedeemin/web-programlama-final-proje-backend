// Set test environment variables before requiring models
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3307';
process.env.DB_NAME = process.env.DB_NAME || 'campus_db_test';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'mysql_root_password';

const request = require('supertest');
const app = require('../../server');
const { User, Student, Faculty, Department } = require('../../models');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

describe('User Endpoints Integration Tests', () => {
  let testDepartment;
  let authToken;
  let testUserId;
  let testUser;

  beforeAll(async () => {
    testDepartment = await Department.create({
      name: 'Computer Science',
      code: 'CS'
    });
  });

  beforeEach(async () => {
    // Create authenticated user for each test
    testUser = await User.create({
      email: 'user@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      isEmailVerified: true,
      isActive: true
    });

    await Student.create({
      userId: testUser.id,
      studentNumber: 'CS240001',
      departmentId: testDepartment.id,
      enrollmentYear: 2024
    });

    testUserId = testUser.id;
    authToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET || 'test-secret-key', {
      expiresIn: '15m'
    });
  });

  afterEach(async () => {
    // Clean up uploads
    const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(uploadDir, file));
        }
      });
    }

    await User.destroy({ where: {}, force: true });
    await Student.destroy({ where: {}, force: true });
    await Faculty.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await Department.destroy({ where: {}, force: true });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe('user@test.com');
      expect(res.body.data.firstName).toBe('Test');
      expect(res.body.data.lastName).toBe('User');
      expect(res.body.data.password).toBeUndefined(); // Password should not be in response
      expect(res.body.message).toBeUndefined(); // GET should not have message field
    });

    it('should handle get profile service errors properly', async () => {
      // Create a user, get token, then delete user to trigger error in getProfile route handler
      const tempUser = await User.create({
        email: 'tempprofile@test.com',
        password: 'password123',
        firstName: 'Temp',
        lastName: 'User',
        role: 'student',
        isEmailVerified: true,
        isActive: true
      });

      await Student.create({
        userId: tempUser.id,
        studentNumber: 'CS240002',
        departmentId: testDepartment.id,
        enrollmentYear: 2024
      });

      const tempToken = jwt.sign({ id: tempUser.id }, process.env.JWT_SECRET || 'test-secret-key', {
        expiresIn: '15m'
      });

      // Delete user to cause error in getProfile - this will trigger the catch block
      await User.destroy({ where: { id: tempUser.id }, force: true });
      await Student.destroy({ where: { userId: tempUser.id }, force: true });

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tempToken}`);

      // Should handle error gracefully - this tests the error handler in route (lines 176-177)
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should include student profile in response', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.studentProfile).toBeDefined();
      expect(res.body.data.studentProfile.studentNumber).toBe('CS240001');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });

    it('should reject request with expired token', async () => {
      const expiredToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET || 'test-secret-key', {
        expiresIn: '-1h' // Already expired
      });

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile with valid data', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '1234567890'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.data.firstName).toBe('Updated');
      expect(res.body.data.lastName).toBe('Name');
      expect(res.body.data.phone).toBe('1234567890');
    });

    it('should handle update profile service errors properly', async () => {
      // Delete user after getting token to trigger error in updateProfile route handler
      const tempUser = await User.create({
        email: 'tempupdate@test.com',
        password: 'password123',
        firstName: 'Temp',
        lastName: 'User',
        role: 'student',
        isEmailVerified: true,
        isActive: true
      });

      const tempToken = jwt.sign({ id: tempUser.id }, process.env.JWT_SECRET || 'test-secret-key', {
        expiresIn: '15m'
      });

      // Delete user to cause error in updateProfile - this will trigger the catch block
      await User.destroy({ where: { id: tempUser.id }, force: true });

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          firstName: 'Updated'
        });

      // Should handle error gracefully - this tests the error handler in route (lines 192-193)
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('should update only provided fields', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'NewFirstName'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.firstName).toBe('NewFirstName');
      expect(res.body.data.lastName).toBe('User'); // Should remain unchanged
    });

    it('should validate firstName is not empty', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: ''
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject update without authentication', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({
          firstName: 'Test'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should not allow updating email or password through profile endpoint', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'newemail@test.com',
          password: 'newpassword123'
        });

      // Should succeed but email/password should not be updated
      expect(res.statusCode).toBe(200);
      const user = await User.findByPk(testUserId);
      expect(user.email).toBe('user@test.com'); // Should remain unchanged
    });
  });

  describe('POST /api/auth/profile/picture', () => {
    it('should upload profile picture successfully', async () => {
      // Create a dummy image file for testing
      const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const testImagePath = path.join(uploadDir, 'test-original.jpg');
      fs.writeFileSync(testImagePath, 'dummy image content');

      const res = await request(app)
        .post('/api/auth/profile/picture')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('picture', testImagePath);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profilePicture).toBeDefined();
      expect(res.body.data.profilePicture).toContain('/uploads/profile-pictures/');

      // Cleanup
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }, 10000);

    it('should reject upload without file', async () => {
      const res = await request(app)
        .post('/api/auth/profile/picture')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject upload without authentication', async () => {
      const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
      const testImagePath = path.join(uploadDir, 'test-unauth.jpg');
      fs.writeFileSync(testImagePath, 'dummy image content');

      const res = await request(app)
        .post('/api/auth/profile/picture')
        .attach('picture', testImagePath);

      expect(res.statusCode).toBe(401);

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it('should update user profile picture in database', async () => {
      const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const testImagePath = path.join(uploadDir, 'test-db.jpg');
      fs.writeFileSync(testImagePath, 'dummy image content');

      const res = await request(app)
        .post('/api/auth/profile/picture')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('picture', testImagePath);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile picture uploaded successfully');

      const user = await User.findByPk(testUserId);
      expect(user.profilePicture).toBeDefined();

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }, 10000);

    it('should handle profile picture upload service errors properly', async () => {
      const uploadDir = path.join(__dirname, '../../../uploads/profile-pictures');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const testImagePath = path.join(uploadDir, 'test-error.jpg');
      fs.writeFileSync(testImagePath, 'dummy image content');

      // Create a user, get token, then delete user to trigger error in updateProfilePicture route handler
      const tempUser = await User.create({
        email: 'tempupload@test.com',
        password: 'password123',
        firstName: 'Temp',
        lastName: 'User',
        role: 'student',
        isEmailVerified: true,
        isActive: true
      });

      const tempToken = jwt.sign({ id: tempUser.id }, process.env.JWT_SECRET || 'test-secret-key', {
        expiresIn: '15m'
      });

      // Delete user to cause error in updateProfilePicture - this will trigger the catch block
      await User.destroy({ where: { id: tempUser.id }, force: true });

      const res = await request(app)
        .post('/api/auth/profile/picture')
        .set('Authorization', `Bearer ${tempToken}`)
        .attach('picture', testImagePath);

      // Should handle error gracefully - this tests the error handler in route (line 218)
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);

      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }, 10000);
  });
});

