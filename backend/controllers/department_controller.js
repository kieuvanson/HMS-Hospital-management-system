import Department from '../models/Department.js';

// Lấy tất cả khoa
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('manager', 'name email');
    return res.status(200).json({
      message: "Lấy danh sách khoa thành công",
      data: departments
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách khoa:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Lấy khoa theo ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).populate('manager', 'name email');
    
    if (!department) {
      return res.status(404).json({ message: "Không tìm thấy khoa" });
    }

    return res.status(200).json({
      message: "Lấy thông tin khoa thành công",
      data: department
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin khoa:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Tạo khoa mới
export const createDepartment = async (req, res) => {
  try {
    const { name, description, phone, email, manager, floor, beds } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tên khoa là bắt buộc" });
    }

    const newDepartment = await Department.create({
      name,
      description,
      phone,
      email,
      manager,
      floor,
      beds
    });

    return res.status(201).json({
      message: "Tạo khoa thành công",
      data: newDepartment
    });
  } catch (error) {
    console.error("Lỗi tạo khoa:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Cập nhật khoa
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, phone, email, manager, floor, beds } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      {
        name,
        description,
        phone,
        email,
        manager,
        floor,
        beds,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('manager', 'name email');

    if (!department) {
      return res.status(404).json({ message: "Không tìm thấy khoa" });
    }

    return res.status(200).json({
      message: "Cập nhật khoa thành công",
      data: department
    });
  } catch (error) {
    console.error("Lỗi cập nhật khoa:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Xóa khoa (soft delete)
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: "Không tìm thấy khoa" });
    }

    return res.status(200).json({
      message: "Xóa khoa thành công",
      data: department
    });
  } catch (error) {
    console.error("Lỗi xóa khoa:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};
