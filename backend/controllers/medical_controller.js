import MedicalRecord from "../models/medical_record.js";
export const createMedicalRecord = async (req, res) => {

    try {
        const doctorId = req.user._id;
        console.log('5. doctorId extracted:', doctorId);
        const {
            patientId,
            visitDate,
            chiefComplaint,
            symptoms,
            vitalSigns,
            diagnosis,
            icdCode,
            medicalHistory,
            allergies,
            prescription,
            notes,
            labResults,
            attachments,
            followUpDate,
            status
        } = req.body;


        // Validate required fields
        if (!patientId || !visitDate || !chiefComplaint || !diagnosis) {
            return res.status(400).json({ 
                message: "Thiếu thông tin bắt buộc",
                required: ["patientId", "visitDate", "chiefComplaint", "diagnosis"]
            });
        }

       
        const newRecord = await MedicalRecord.create({
            patientId,
            doctorId,
            visitDate,
            chiefComplaint,
            symptoms,
            vitalSigns,
            diagnosis,
            icdCode,
            medicalHistory,
            allergies,
            prescription,
            notes,
            labResults,
            attachments,
            followUpDate,
            status
        });

        return res.status(201).json({
            message: "Tạo hồ sơ y tế thành công",
            data: newRecord
        });
    } catch (error) {
        console.error("Lỗi tạo hồ sơ y tế:", error);
        
        // ✅ Trả về lỗi chi tiết hơn
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Dữ liệu không hợp lệ",
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        return res.status(500).json({
            message: "Lỗi máy chủ, vui lòng thử lại sau"
        });
    }
};

export const getMedicalRecords = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const userRole = req.user.role;

        // ✅ Bác sĩ chỉ xem hồ sơ của mình, admin xem tất cả
        const query = userRole === 'admin' ? {} : { doctorId };

        const medicalRecords = await MedicalRecord.find(query)
            .populate('patientId', 'name age gender') // ✅ Thêm thông tin bệnh nhân
            .populate('doctorId', 'name specialty') // ✅ Thêm thông tin bác sĩ
            .sort({ visitDate: -1 }); // ✅ Sắp xếp mới nhất trước

        return res.status(200).json({
            message: "Lấy danh sách hồ sơ thành công",
            count: medicalRecords.length,
            data: medicalRecords
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách hồ sơ y tế:", error);
        return res.status(500).json({ 
            message: "Lỗi máy chủ, vui lòng thử lại sau" 
        });
    }
};

export const getMedicalRecordById = async (req, res) => {
    try {
        const medicalRecord = await MedicalRecord.findById(req.params.id);
        if (!medicalRecord) {
            return res.status(404).json({ message: "Hồ sơ y tế không tồn tại" });
        }
        return res.status(200).json(medicalRecord);
    } catch (error) {
        console.error("Lỗi lấy hồ sơ y tế:", error);
        return res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại sau" });
    }
};

export const updateMedicalRecord = async (req, res) => {
    try {
        const updatedRecord = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedRecord) {
            return res.status(404).json({ message: "Hồ sơ y tế không tồn tại" });
        }
        return res.status(200).json({
            message: "Cập nhật hồ sơ y tế thành công",
            data: updatedRecord
        });
    } catch (error) {
        console.error("Lỗi cập nhật hồ sơ y tế:", error);
        return res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại sau" });
    }
};

export const deleteMedicalRecord = async (req, res) => {
    try {
        const deletedRecord = await MedicalRecord.findByIdAndDelete(req.params.id);
        if (!deletedRecord) {
            return res.status(404).json({ message: "Hồ sơ y tế không tồn tại" });
        }
        return res.status(200).json({ message: "Xóa hồ sơ y tế thành công" });
    } catch (error) {
        console.error("Lỗi xóa hồ sơ y tế:", error);
        return res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại sau" });
    }
};