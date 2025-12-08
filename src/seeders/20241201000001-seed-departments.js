'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Mevcut bölümleri güncelle veya ekle
    const departments = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Bilgisayar Mühendisliği',
        code: 'BM',
        description: 'Bilgisayar Mühendisliği Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Elektrik-Elektronik Mühendisliği',
        code: 'EE',
        description: 'Elektrik-Elektronik Mühendisliği Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Makine Mühendisliği',
        code: 'ME',
        description: 'Makine Mühendisliği Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Endüstri Mühendisliği',
        code: 'IE',
        description: 'Endüstri Mühendisliği Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'İnşaat Mühendisliği',
        code: 'CE',
        description: 'İnşaat Mühendisliği Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Yazılım Mühendisliği',
        code: 'SE',
        description: 'Yazılım Mühendisliği Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        name: 'Biyomedikal Mühendisliği',
        code: 'BME',
        description: 'Biyomedikal Mühendisliği Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        name: 'Kimya Mühendisliği',
        code: 'CHE',
        description: 'Kimya Mühendisliği Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        name: 'İşletme',
        code: 'BUS',
        description: 'İşletme Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'İktisat',
        code: 'ECO',
        description: 'İktisat Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Psikoloji',
        code: 'PSY',
        description: 'Psikoloji Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Hukuk',
        code: 'LAW',
        description: 'Hukuk Fakültesi',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Tıp',
        code: 'MED',
        description: 'Tıp Fakültesi',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        name: 'Eğitim Bilimleri',
        code: 'EDU',
        description: 'Eğitim Bilimleri Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        name: 'Mimarlık',
        code: 'ARCH',
        description: 'Mimarlık Bölümü',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Her bölüm için upsert (varsa güncelle, yoksa ekle) - MySQL syntax
    for (const dept of departments) {
      await queryInterface.sequelize.query(`
        INSERT INTO departments (id, name, code, description, isActive, createdAt, updatedAt)
        VALUES (:id, :name, :code, :description, :isActive, :createdAt, :updatedAt)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          code = VALUES(code),
          description = VALUES(description),
          isActive = VALUES(isActive),
          updatedAt = VALUES(updatedAt)
      `, {
        replacements: dept,
        type: Sequelize.QueryTypes.INSERT
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('departments', null, {});
  }
};

