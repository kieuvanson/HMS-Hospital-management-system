import Specialty from '../models/Specialty.js';

// Lấy tất cả chuyên khoa
export const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find({ isActive: true })
      .populate('departmentId', 'name')
      .sort({ displayOrder: 1, name: 1 });
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách chuyên khoa', error });
  }
};
