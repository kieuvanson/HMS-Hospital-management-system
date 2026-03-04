import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, specialtyAPI, doctorAPI } from '../services/api';
import axios from 'axios';

const SPECIALTIES = [
    'Nội', 'Ngoại', 'Sản', 'Nhi', 'Tim mạch', 'Da liễu', 'Tai mũi họng', 'Mắt', 'Răng hàm mặt', 'Thần kinh', 'Ung bướu', 'Khác'
];
const TIME_SLOTS = [
    // Sáng: 9h-12h
    { label: '9h-10h', value: '09:00' },
    { label: '10h-11h', value: '10:00' },
    { label: '11h-12h', value: '11:00' },
    // Chiều: 13h30-18h
    { label: '13h30-14h30', value: '13:30' },
    { label: '14h30-15h30', value: '14:30' },
    { label: '15h30-16h30', value: '15:30' },
    { label: '16h30-17h30', value: '16:30' },
    { label: '17h30-18h30', value: '17:30' }
];

const initialForm = {
    // Thông tin bệnh nhân
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    gender: '',
    cccd: '',
    // Địa chỉ
    address: '',
    province: '',
    // Đặt lịch
    appointmentDate: '',
    appointmentTime: '',
    specialty: '',
    doctorProfileId: '',
    type: '',
    // Y tế
    reason: '',
    medicalHistory: '',
    hasVisited: '',
    oldPatientCode: '',
    // Thanh toán
    paymentMethod: '',
    bhyt: '',
    // Ghi chú
    notes: '',
    // Xác nhận
    agree: false,
    otp: '',
};

const AppointmentForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(() => {
        // Lấy nháp nếu có
        const draft = localStorage.getItem('appointmentDraft');
        return draft ? JSON.parse(draft) : initialForm;
    });
    const [allDoctors, setAllDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(null);
    const [errors, setErrors] = useState({});
    // Lấy danh sách tỉnh/thành phố mẫu
    const provinces = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Khác'];
    const [specialties, setSpecialties] = useState([]);
    const [bookedTimeSlots, setBookedTimeSlots] = useState([]);

    useEffect(() => {
        // Lấy danh sách chuyên khoa từ API khi mở form
        specialtyAPI.getAll().then(data => {
            setSpecialties(data);
        }).catch(() => setSpecialties([]));
        setAllDoctors([]); // Xóa dữ liệu cũ
    }, []);

    useEffect(() => {
        // Khi chọn chuyên khoa, gọi API lấy bác sĩ theo chuyên khoa
        if (form.specialty) {
            doctorAPI.getBySpecialty(form.specialty).then(data => {
                setFilteredDoctors(data);
            }).catch(() => setFilteredDoctors([]));
        } else {
            setFilteredDoctors([]);
        }
        // Reset chọn bác sĩ nếu đổi chuyên khoa
        setSelectedDoctor(null);
        // eslint-disable-next-line
    }, [form.specialty]);

    // Khi chọn bác sĩ thì set selectedDoctor
    useEffect(() => {
        if (form.doctorProfileId) {
            const doc = filteredDoctors.find(d => d._id === form.doctorProfileId);
            setSelectedDoctor(doc || null);
        } else {
            setSelectedDoctor(null);
        }
    }, [form.doctorProfileId, filteredDoctors]);

    // Lấy lịch hẹn đã đặt của bác sĩ trong ngày
    useEffect(() => {
        if (form.doctorProfileId && form.appointmentDate) {
            appointmentAPI.getByDoctorAndDate(form.doctorProfileId, form.appointmentDate)
                .then(data => {
                    // Lấy danh sách khung giờ đã đặt
                    const booked = data.map(appointment => appointment.appointmentTime);
                    setBookedTimeSlots(booked);
                })
                .catch(() => setBookedTimeSlots([]));
        } else {
            setBookedTimeSlots([]);
        }
    }, [form.doctorProfileId, form.appointmentDate]);

    // Validation từng trường
    const validate = (f = form) => {
        const err = {};
        if (!f.province) err.province = 'Bắt buộc';
        if (!f.appointmentDate) err.appointmentDate = 'Bắt buộc';
        if (!f.appointmentTime) err.appointmentTime = 'Bắt buộc';
        if (!f.specialty) err.specialty = 'Bắt buộc';
        if (!f.doctorProfileId) err.doctorProfileId = 'Bắt buộc';
        if (!f.reason) err.reason = 'Bắt buộc';
        if (!f.agree) err.agree = 'Bạn cần đồng ý với điều khoản';
        return err;
    };

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
        setErrors(e => ({ ...e, [name]: undefined }));
    };

    // Lưu nháp
    const handleSaveDraft = () => {
        localStorage.setItem('appointmentDraft', JSON.stringify(form));
        setMessage('Đã lưu nháp!');
        setSuccess(true);
    };

    // Gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        setErrors(err);
        if (Object.keys(err).length > 0) {
            setMessage('Vui lòng kiểm tra lại các trường bắt buộc.');
            setSuccess(false);
            return;
        }
        
        // Chỉ gửi các field cần thiết
        const appointmentData = {
            doctorProfileId: form.doctorProfileId,
            appointmentDate: form.appointmentDate,
            appointmentTime: form.appointmentTime,
            reason: form.reason,
            symptoms: form.medicalHistory,
            notes: form.notes
        };
        
        try {
            await appointmentAPI.bookAppointment(appointmentData);
            setSuccess(true);
            setMessage('Đặt lịch thành công! Vui lòng kiểm tra lại thông tin và đến đúng giờ.');
            localStorage.removeItem('appointmentDraft');
            setForm(initialForm);
        } catch (error) {
            setSuccess(false);
            setMessage('Đặt lịch không thành công. Vui lòng thử lại hoặc kiểm tra thông tin.');
        }
    };

    const isDoctorSelected = !!selectedDoctor;

    return (
        <div className="w-full px-8 flex flex-row gap-12 items-start justify-center relative">
            {/* Form bên trái - căn giữa khi chưa chọn bác sĩ, dịch trái khi đã chọn */}
            <div className={`transition-all duration-300 ease-in-out ${isDoctorSelected ? 'w-[800px] flex-none -translate-x-8' : 'w-[800px] flex-none'}`}>
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-12 space-y-8 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-2">Đặt Lịch Khám</h2>
                    {message && (
                        <div className={success ? 'text-green-600 font-medium mb-2' : 'text-red-600 font-medium mb-2'}>
                            {message}
                        </div>
                    )}
                    {/* ...các trường form giữ nguyên như trên, chỉ bỏ trường OTP... */}
                    {/* Thông tin bệnh nhân */}
                    <div>
                        <h3 className="font-semibold mb-2">Thông tin bệnh nhân</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="font-medium">Họ và tên <span className="text-red-500">*</span></label>
                                <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                {errors.fullName && <div className="text-xs text-red-500">{errors.fullName}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Số điện thoại <span className="text-red-500">*</span></label>
                                <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                {errors.phone && <div className="text-xs text-red-500">{errors.phone}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Email</label>
                                <input name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="font-medium">Ngày sinh <span className="text-red-500">*</span></label>
                                <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                {errors.dob && <div className="text-xs text-red-500">{errors.dob}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Giới tính <span className="text-red-500">*</span></label>
                                <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Chọn</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                                {errors.gender && <div className="text-xs text-red-500">{errors.gender}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Số CMND/CCCD</label>
                                <input name="cccd" value={form.cccd} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>
                    </div>
                    {/* Địa chỉ */}
                    <div>
                        <h3 className="font-semibold mb-2">Địa chỉ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="font-medium">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                                <input name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                {errors.address && <div className="text-xs text-red-500">{errors.address}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                                <select name="province" value={form.province} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Chọn</option>
                                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                {errors.province && <div className="text-xs text-red-500">{errors.province}</div>}
                            </div>
                        </div>
                    </div>
                    {/* Đặt lịch */}
                    <div>
                        <h3 className="font-semibold mb-2">Thông tin đặt lịch</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="font-medium">Ngày khám <span className="text-red-500">*</span></label>
                                <input type="date" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                {errors.appointmentDate && <div className="text-xs text-red-500">{errors.appointmentDate}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Khung giờ khám <span className="text-red-500">*</span></label>
                                <select name="appointmentTime" value={form.appointmentTime} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Chọn</option>
                                    {TIME_SLOTS.map(s => {
                                        const isBooked = bookedTimeSlots.includes(s.value);
                                        return (
                                            <option key={s.value} value={s.value} disabled={isBooked}>
                                                {s.label} {isBooked ? '- Đã có lịch hẹn' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                                {errors.appointmentTime && <div className="text-xs text-red-500">{errors.appointmentTime}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Chuyên khoa <span className="text-red-500">*</span></label>
                                <select name="specialty" value={form.specialty} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Chọn</option>
                                    {specialties.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                                {errors.specialty && <div className="text-xs text-red-500">{errors.specialty}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Bác sĩ</label>
                                <select name="doctorProfileId" value={form.doctorProfileId} onChange={handleChange} disabled={!form.specialty || filteredDoctors.length === 0} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                                    <option value="">{form.specialty ? (filteredDoctors.length ? 'Chọn bác sĩ' : 'Không có bác sĩ') : 'Chọn chuyên khoa trước'}</option>
                                    {filteredDoctors.map((doctor) => (
                                        <option key={doctor._id} value={doctor._id}>
                                            {doctor.userId?.name || doctor.name} {doctor.degree ? `(${doctor.degree})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {selectedDoctor && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/doctor/${selectedDoctor._id}`)}
                                        className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm w-full"
                                    >
                                        Xem thông tin bác sĩ
                                    </button>
                                )}
                            </div>
                            <div>
                                <label className="font-medium">Loại khám</label>
                                <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Chọn</option>
                                    <option value="new">Khám mới</option>
                                    <option value="re">Tái khám</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Thông tin y tế */}
                    <div>
                        <h3 className="font-semibold mb-2">Thông tin y tế</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="font-medium">Lý do khám / Triệu chứng <span className="text-red-500">*</span></label>
                                <textarea name="reason" value={form.reason} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                {errors.reason && <div className="text-xs text-red-500">{errors.reason}</div>}
                            </div>
                            <div>
                                <label className="font-medium">Tiền sử bệnh / Dị ứng thuốc</label>
                                <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="font-medium">Đã từng khám tại đây?</label>
                                <select name="hasVisited" value={form.hasVisited} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="">Chọn</option>
                                    <option value="yes">Có</option>
                                    <option value="no">Chưa</option>
                                </select>
                            </div>
                            {form.hasVisited === 'yes' && (
                                <div>
                                    <label className="font-medium">Mã bệnh nhân / Số hồ sơ cũ <span className="text-red-500">*</span></label>
                                    <input name="oldPatientCode" value={form.oldPatientCode} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                    {errors.oldPatientCode && <div className="text-xs text-red-500">{errors.oldPatientCode}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Ghi chú bổ sung */}
                    <div>
                        <h3 className="font-semibold mb-2">Ghi chú bổ sung</h3>
                        <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Yêu cầu đặc biệt, ghi chú thêm..." />
                    </div>
                    {/* Xác nhận */}
                    <div className="flex flex-col gap-2">
                        <label className="inline-flex items-center gap-2">
                            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
                            Tôi đồng ý với <a href="#" className="underline text-primary-600">điều khoản sử dụng dịch vụ</a> <span className="text-red-500">*</span>
                        </label>
                        {errors.agree && <div className="text-xs text-red-500">{errors.agree}</div>}
                    </div>
                    {/* Nút hành động */}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="px-5 py-2 rounded bg-primary-600 text-white font-semibold hover:bg-primary-700">Đặt Lịch Ngay</button>
                        <button type="button" onClick={handleSaveDraft} className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Lưu nháp</button>
                        <button type="button" onClick={() => {
                            if (window.confirm('Bạn có chắc muốn hủy đặt lịch?')) {
                                window.location.href = '/patient/home';
                            }
                        }} className="px-5 py-2 rounded bg-red-100 text-red-600 font-semibold hover:bg-red-200">Hủy</button>
                    </div>
                    <div className="text-xs text-gray-400">Các trường <span className="text-red-500">*</span> là bắt buộc</div>
                </form>
            </div>

        </div>
    );
};

export default AppointmentForm;