// Set test environment variables before requiring models
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3307';
process.env.DB_NAME = process.env.DB_NAME || 'campus_db_test';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'mysql_root_password';

const authService = require('../../services/authService');
const { User, Student, Faculty, Department } = require('../../models');
const bcrypt = require('bcryptjs');

describe('AuthService Unit Tests', () => {
  let testDepartment;
  let testUser;

  beforeAll(async () => {
    // Create test department
    testDepartment = await Department.create({
      name: 'Computer Science',
      code: 'CS'
    });
  });

  afterEach(async () => {
    // Clean up users after each test
    await User.destroy({ where: {}, force: true });
    await Student.destroy({ where: {}, force: true });
    await Faculty.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await Department.destroy({ where: {}, force: true });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const token = authService.generateToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const refreshToken = authService.generateRefreshToken(userId);
      
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3);
    });
  });

  describe('generateStudentNumber', () => {
    it('should generate unique student numbers', async () => {
      const studentNumber1 = await authService.generateStudentNumber('CS', 2024);
      const studentNumber2 = await authService.generateStudentNumber('CS', 2024);
      
      expect(studentNumber1).toBeDefined();
      expect(studentNumber2).toBeDefined();
      expect(studentNumber1).not.toBe(studentNumber2);
      expect(studentNumber1).toMatch(/^CS24\d{4}$/);
    });

    it('should increment counter when student number exists', async () => {
      // Create a student with specific number to force counter increment
      const user = await User.create({
        email: 'counter1@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      });

      await Student.create({
        userId: user.id,
        studentNumber: 'CS240001',
        departmentId: testDepartment.id,
        enrollmentYear: 2024
      });

      // Next generated number should be CS240002
      const newNumber = await authService.generateStudentNumber('CS', 2024);
      expect(newNumber).toBe('CS240002');

      await user.destroy({ force: true });
    });
  });

  describe('generateEmployeeNumber', () => {
    it('should generate unique employee numbers', async () => {
      const employeeNumber1 = await authService.generateEmployeeNumber('CS');
      const employeeNumber2 = await authService.generateEmployeeNumber('CS');
      
      expect(employeeNumber1).toBeDefined();
      expect(employeeNumber2).toBeDefined();
      expect(employeeNumber1).not.toBe(employeeNumber2);
      expect(employeeNumber1).toMatch(/^CS\d{5}$/);
    });

    it('should increment counter when employee number exists', async () => {
      const user = await User.create({
        email: 'empcounter1@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'faculty'
      });

      await Faculty.create({
        userId: user.id,
        employeeNumber: 'CS00001',
        departmentId: testDepartment.id,
        title: 'lecturer'
      });

      // Next generated number should be CS00002
      const newNumber = await authService.generateEmployeeNumber('CS');
      expect(newNumber).toBe('CS00002');

      await user.destroy({ force: true });
    });
  });

  describe('register', () => {
    it('should register a new student successfully', async () => {
      const userData = {
        email: 'student@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        departmentId: testDepartment.id,
        enrollmentYear: 2024
      };

      const user = await authService.register(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe('student@test.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.role).toBe('student');
      expect(user.isEmailVerified).toBe(false);
      expect(user.emailVerificationToken).toBeDefined();

      // Check student profile was created
      const student = await Student.findOne({ where: { userId: user.id } });
      expect(student).toBeDefined();
      expect(student.studentNumber).toBeDefined();
    });

    it('should register a new faculty successfully', async () => {
      const userData = {
        email: 'faculty@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'faculty',
        departmentId: testDepartment.id,
        title: 'professor'
      };

      const user = await authService.register(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe('faculty@test.com');
      expect(user.role).toBe('faculty');

      // Check faculty profile was created
      const faculty = await Faculty.findOne({ where: { userId: user.id } });
      expect(faculty).toBeDefined();
      expect(faculty.employeeNumber).toBeDefined();
    });

    it('should not register with duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        departmentId: testDepartment.id
      };

      await authService.register(userData);
      
      await expect(authService.register(userData)).rejects.toThrow('Bu e-posta adresi ile zaten bir hesap mevcut');
    });

    it('should hash password during registration', async () => {
      const userData = {
        email: 'hashtest@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        departmentId: testDepartment.id
      };

      const user = await authService.register(userData);
      const dbUser = await User.findByPk(user.id);
      
      expect(dbUser.password).not.toBe('password123');
      expect(await bcrypt.compare('password123', dbUser.password)).toBe(true);
    });

    it('should reject registration with non-existent department', async () => {
      const userData = {
        email: 'nodept@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        departmentId: 'non-existent-id'
      };

      await expect(authService.register(userData)).rejects.toThrow('Seçilen bölüm bulunamadı');
    });

    it('should reject registration with inactive department', async () => {
      const inactiveDept = await Department.create({
        name: 'Inactive Department',
        code: 'INACT',
        isActive: false
      });

      const userData = {
        email: 'inactive@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        departmentId: inactiveDept.id
      };

      await expect(authService.register(userData)).rejects.toThrow('Seçilen bölüm aktif değil');

      await inactiveDept.destroy({ force: true });
    });

    it('should handle email sending failure gracefully', async () => {
      const emailService = require('../../services/emailService');
      const originalSend = emailService.sendVerificationEmail;
      emailService.sendVerificationEmail = jest.fn().mockRejectedValue(new Error('SMTP Error'));

      const userData = {
        email: 'emailfail@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        departmentId: testDepartment.id
      };

      // Should not throw error even if email fails
      const user = await authService.register(userData);
      expect(user).toBeDefined();
      expect(user.email).toBe('emailfail@test.com');

      // Restore original function
      emailService.sendVerificationEmail = originalSend;
    });

    it('should delete user if student profile creation fails with unique constraint', async () => {
      const userData1 = {
        email: 'unique1@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        departmentId: testDepartment.id,
        studentNumber: 'UNIQUE001'
      };

      // First registration succeeds
      await authService.register(userData1);

      // Second registration with same student number should fail and delete user
      const userData2 = {
        email: 'unique2@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User2',
        role: 'student',
        departmentId: testDepartment.id,
        studentNumber: 'UNIQUE001'
      };

      await expect(authService.register(userData2)).rejects.toThrow('Bu öğrenci numarası zaten kullanılıyor');

      // User should be deleted
      const deletedUser = await User.findOne({ where: { email: 'unique2@test.com' } });
      expect(deletedUser).toBeNull();
    });

    it('should delete user if faculty profile creation fails with unique constraint', async () => {
      const userData1 = {
        email: 'facunique1@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Faculty',
        role: 'faculty',
        departmentId: testDepartment.id,
        employeeNumber: 'FACUNIQUE001'
      };

      // First registration succeeds
      await authService.register(userData1);

      // Second registration with same employee number should fail and delete user
      const userData2 = {
        email: 'facunique2@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Faculty2',
        role: 'faculty',
        departmentId: testDepartment.id,
        employeeNumber: 'FACUNIQUE001'
      };

      await expect(authService.register(userData2)).rejects.toThrow('Bu personel numarası zaten kullanılıyor');

      // User should be deleted
      const deletedUser = await User.findOne({ where: { email: 'facunique2@test.com' } });
      expect(deletedUser).toBeNull();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const user = await User.create({
        email: 'verify@test.com',
        password: 'password123',
        firstName: 'Verify',
        lastName: 'User',
        role: 'student',
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const verifiedUser = await authService.verifyEmail('valid-token');
      
      expect(verifiedUser.isEmailVerified).toBe(true);
      expect(verifiedUser.emailVerificationToken).toBeNull();
    });

    it('should reject expired token', async () => {
      await User.create({
        email: 'expired@test.com',
        password: 'password123',
        firstName: 'Expired',
        lastName: 'User',
        role: 'student',
        emailVerificationToken: 'expired-token',
        emailVerificationExpires: new Date(Date.now() - 1000) // Expired
      });

      await expect(authService.verifyEmail('expired-token')).rejects.toThrow('Invalid or expired verification token');
    });

    it('should reject invalid token', async () => {
      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow('Invalid or expired verification token');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'login@test.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
        role: 'student',
        isEmailVerified: true,
        isActive: true
      });
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login('login@test.com', 'password123');
      
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('login@test.com');
    });

    it('should not login with invalid email', async () => {
      await expect(authService.login('wrong@test.com', 'password123')).rejects.toThrow('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      await expect(authService.login('login@test.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should not login with inactive user', async () => {
      await testUser.update({ isActive: false });
      
      await expect(authService.login('login@test.com', 'password123')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    let refreshToken;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'refresh@test.com',
        password: 'password123',
        firstName: 'Refresh',
        lastName: 'User',
        role: 'student',
        isActive: true
      });

      refreshToken = authService.generateRefreshToken(testUser.id);
      await testUser.update({ refreshToken });
    });

    it('should refresh token with valid refresh token', async () => {
      const result = await authService.refreshToken(refreshToken);
      
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe(refreshToken); // Should be new token
    });

    it('should reject invalid refresh token', async () => {
      await expect(authService.refreshToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should reject expired refresh token', async () => {
      // Create expired token by mocking jwt.verify
      const jwt = require('jsonwebtoken');
      const originalVerify = jwt.verify;
      
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });
      
      await expect(authService.refreshToken('expired-token')).rejects.toThrow('Invalid refresh token');
      
      jwt.verify = originalVerify;
    });

    it('should reject refresh token for non-existent user', async () => {
      const fakeToken = authService.generateRefreshToken('non-existent-id');
      
      await expect(authService.refreshToken(fakeToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should reject refresh token when user is inactive', async () => {
      await testUser.update({ isActive: false });
      
      refreshToken = authService.generateRefreshToken(testUser.id);
      testUser.refreshToken = refreshToken;
      await testUser.save();
      
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should reject refresh token when token does not match stored token', async () => {
      testUser.refreshToken = 'different-token';
      await testUser.save();
      
      refreshToken = authService.generateRefreshToken(testUser.id);
      
      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'logout@test.com',
        password: 'password123',
        firstName: 'Logout',
        lastName: 'User',
        role: 'student',
        refreshToken: 'some-refresh-token'
      });
    });

    it('should logout user and clear refresh token', async () => {
      const result = await authService.logout(testUser.id);
      
      expect(result.message).toBe('Logged out successfully');
      
      const user = await User.findByPk(testUser.id);
      expect(user.refreshToken).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'forgot@test.com',
        password: 'password123',
        firstName: 'Forgot',
        lastName: 'User',
        role: 'student'
      });
    });

    it('should generate password reset token for existing user', async () => {
      const result = await authService.forgotPassword('forgot@test.com');
      
      expect(result.message).toBe('If email exists, password reset link has been sent');
      
      const user = await User.findByPk(testUser.id);
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
    });

    it('should return same message for non-existent user (security)', async () => {
      const result = await authService.forgotPassword('nonexistent@test.com');
      
      expect(result.message).toBe('If email exists, password reset link has been sent');
    });

    it('should handle email sending failure gracefully', async () => {
      const emailService = require('../../services/emailService');
      const originalSend = emailService.sendPasswordResetEmail;
      emailService.sendPasswordResetEmail = jest.fn().mockRejectedValue(new Error('SMTP Error'));

      // Should not throw error even if email fails
      const result = await authService.forgotPassword('forgot@test.com');
      expect(result.message).toBe('If email exists, password reset link has been sent');
      
      // Token should still be set
      const user = await User.findByPk(testUser.id);
      expect(user.passwordResetToken).toBeDefined();

      // Restore original function
      emailService.sendPasswordResetEmail = originalSend;
    });
  });

  describe('resetPassword', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'reset@test.com',
        password: 'oldpassword',
        firstName: 'Reset',
        lastName: 'User',
        role: 'student',
        passwordResetToken: 'valid-reset-token',
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000)
      });
    });

    it('should reset password with valid token', async () => {
      const result = await authService.resetPassword('valid-reset-token', 'newpassword123');
      
      expect(result.message).toBe('Password reset successfully');
      
      const user = await User.findByPk(testUser.id);
      expect(user.passwordResetToken).toBeNull();
      expect(await user.comparePassword('newpassword123')).toBe(true);
    });

    it('should reject expired reset token', async () => {
      await testUser.update({
        passwordResetExpires: new Date(Date.now() - 1000)
      });

      await expect(authService.resetPassword('valid-reset-token', 'newpassword123')).rejects.toThrow('Invalid or expired reset token');
    });

    it('should reject invalid reset token', async () => {
      await expect(authService.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow('Invalid or expired reset token');
    });
  });

  describe('getProfile', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'profile@test.com',
        password: 'password123',
        firstName: 'Profile',
        lastName: 'User',
        role: 'student'
      });

      await Student.create({
        userId: testUser.id,
        studentNumber: 'CS240001',
        departmentId: testDepartment.id,
        enrollmentYear: 2024
      });
    });

    it('should return user profile with related data', async () => {
      const profile = await authService.getProfile(testUser.id);
      
      expect(profile).toBeDefined();
      expect(profile.email).toBe('profile@test.com');
      expect(profile.studentProfile).toBeDefined();
      expect(profile.studentProfile.studentNumber).toBe('CS240001');
    });

    it('should throw error for non-existent user', async () => {
      await expect(authService.getProfile('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'update@test.com',
        password: 'password123',
        firstName: 'Update',
        lastName: 'User',
        role: 'student',
        phone: '1234567890'
      });
    });

    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '9876543210'
      };

      const updatedUser = await authService.updateProfile(testUser.id, updateData);
      
      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.phone).toBe('9876543210');
    });

    it('should throw error for non-existent user', async () => {
      await expect(authService.updateProfile('non-existent-id', { firstName: 'Test' })).rejects.toThrow('User not found');
    });
  });

  describe('updateProfilePicture', () => {
    beforeEach(async () => {
      testUser = await User.create({
        email: 'picture@test.com',
        password: 'password123',
        firstName: 'Picture',
        lastName: 'User',
        role: 'student'
      });
    });

    it('should update profile picture', async () => {
      const filename = 'test-picture.jpg';
      const updatedUser = await authService.updateProfilePicture(testUser.id, filename);
      
      expect(updatedUser.profilePicture).toBe(filename);
    });

    it('should throw error for non-existent user', async () => {
      await expect(authService.updateProfilePicture('non-existent-id', 'test.jpg')).rejects.toThrow('User not found');
    });

    it('should delete old profile picture when updating', async () => {
      const fs = require('fs');
      const oldFilename = 'old-picture.jpg';
      
      testUser = await User.create({
        email: 'deletepic@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        profilePicture: oldFilename
      });

      // Mock fs.existsSync and fs.unlinkSync
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      const newFilename = 'new-picture.jpg';
      const updatedUser = await authService.updateProfilePicture(testUser.id, newFilename);

      expect(updatedUser.profilePicture).toBe(newFilename);
      expect(existsSyncSpy).toHaveBeenCalledWith(`uploads/profile-pictures/${oldFilename}`);
      expect(unlinkSyncSpy).toHaveBeenCalledWith(`uploads/profile-pictures/${oldFilename}`);

      existsSyncSpy.mockRestore();
      unlinkSyncSpy.mockRestore();
    });

    it('should not delete file if old picture does not exist', async () => {
      const fs = require('fs');
      
      testUser = await User.create({
        email: 'nofile@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        profilePicture: 'non-existent.jpg'
      });

      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      const unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      const newFilename = 'new-picture.jpg';
      const updatedUser = await authService.updateProfilePicture(testUser.id, newFilename);

      expect(updatedUser.profilePicture).toBe(newFilename);
      expect(existsSyncSpy).toHaveBeenCalled();
      expect(unlinkSyncSpy).not.toHaveBeenCalled();

      existsSyncSpy.mockRestore();
      unlinkSyncSpy.mockRestore();
    });
  });
});

