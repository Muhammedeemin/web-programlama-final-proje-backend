const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = require('../../middleware/upload');

// Mock fs
jest.mock('fs');

describe('Upload Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      file: null,
      files: null
    };
    mockRes = {};
    mockNext = jest.fn();
    
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('File filter', () => {
    it('should accept valid image files (jpeg)', () => {
      const file = {
        originalname: 'test.jpeg',
        mimetype: 'image/jpeg'
      };

      const storage = upload.storage;
      expect(storage).toBeDefined();
      
      // Test via multer configuration
      const filter = upload.fileFilter;
      const cb = jest.fn();
      
      filter(mockReq, file, cb);
      
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept valid image files (jpg)', () => {
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg'
      };

      const filter = upload.fileFilter;
      const cb = jest.fn();
      
      filter(mockReq, file, cb);
      
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept valid image files (png)', () => {
      const file = {
        originalname: 'test.png',
        mimetype: 'image/png'
      };

      const filter = upload.fileFilter;
      const cb = jest.fn();
      
      filter(mockReq, file, cb);
      
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept valid image files (gif)', () => {
      const file = {
        originalname: 'test.gif',
        mimetype: 'image/gif'
      };

      const filter = upload.fileFilter;
      const cb = jest.fn();
      
      filter(mockReq, file, cb);
      
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-image files', () => {
      const file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf'
      };

      const filter = upload.fileFilter;
      const cb = jest.fn();
      
      filter(mockReq, file, cb);
      
      expect(cb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Only image files')
        }),
        false
      );
    });

    it('should reject files with invalid extension', () => {
      const file = {
        originalname: 'test.exe',
        mimetype: 'application/x-msdownload'
      };

      const filter = upload.fileFilter;
      const cb = jest.fn();
      
      filter(mockReq, file, cb);
      
      expect(cb).toHaveBeenCalledWith(
        expect.any(Error),
        false
      );
    });

    it('should reject files with invalid mimetype', () => {
      const file = {
        originalname: 'test.jpg',
        mimetype: 'application/pdf'
      };

      const filter = upload.fileFilter;
      const cb = jest.fn();
      
      filter(mockReq, file, cb);
      
      expect(cb).toHaveBeenCalledWith(
        expect.any(Error),
        false
      );
    });
  });

  describe('Storage configuration', () => {
    it('should configure storage with correct destination', () => {
      const storage = upload.storage;
      expect(storage).toBeDefined();
      
      const cb = jest.fn();
      storage.getDestination(mockReq, null, cb);
      
      expect(cb).toHaveBeenCalledWith(null, 'uploads/profile-pictures');
    });

    it('should generate unique filenames', () => {
      const storage = upload.storage;
      const file = {
        originalname: 'profile.jpg'
      };
      const cb = jest.fn();
      
      storage.getFilename(mockReq, file, cb);
      
      expect(cb).toHaveBeenCalledWith(
        null,
        expect.stringMatching(/^profile-\d+-\d+\.jpg$/)
      );
    });

    it('should preserve file extension', () => {
      const storage = upload.storage;
      const file = {
        originalname: 'my-photo.png'
      };
      const cb = jest.fn();
      
      storage.getFilename(mockReq, file, cb);
      
      const filename = cb.mock.calls[0][1];
      expect(filename).toMatch(/\.png$/);
    });
  });

  describe('File size limits', () => {
    it('should have default file size limit', () => {
      expect(upload.limits.fileSize).toBeDefined();
      expect(upload.limits.fileSize).toBe(5242880); // 5MB
    });

    it('should use environment variable for file size limit', () => {
      process.env.MAX_FILE_SIZE = '10485760'; // 10MB
      
      // Reload module to pick up new env var
      jest.resetModules();
      const newUpload = require('../../middleware/upload');
      
      expect(newUpload.limits.fileSize).toBe(10485760);
      
      // Clean up
      delete process.env.MAX_FILE_SIZE;
      jest.resetModules();
    });
  });

  describe('Directory creation', () => {
    it('should create upload directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      
      // Reload module to trigger directory creation
      jest.resetModules();
      require('../../middleware/upload');
      
      expect(fs.mkdirSync).toHaveBeenCalledWith('uploads/profile-pictures', { recursive: true });
    });

    it('should not create directory if it already exists', () => {
      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync.mockClear();
      
      // Reload module
      jest.resetModules();
      require('../../middleware/upload');
      
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });
});

