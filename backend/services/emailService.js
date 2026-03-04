import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Hoặc sử dụng dịch vụ email khác
    auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng
    }
});

export const sendAppointmentConfirmation = async (email, appointment) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Xác nhận lịch hẹn',
        text: `Xin chào,

Lịch hẹn của bạn đã được xác nhận:
- Bác sĩ: ${appointment.doctorInfo.name}
- Ngày: ${appointment.appointmentDate.toLocaleDateString()}
- Giờ: ${appointment.appointmentTime}

Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.`
    };

    await transporter.sendMail(mailOptions);
};

export const sendAppointmentReminder = async (email, appointment) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Nhắc nhở lịch hẹn',
        text: `Xin chào,

Đây là nhắc nhở về lịch hẹn sắp tới của bạn:
- Bác sĩ: ${appointment.doctorInfo.name}
- Ngày: ${appointment.appointmentDate.toLocaleDateString()}
- Giờ: ${appointment.appointmentTime}

Vui lòng đến đúng giờ. Cảm ơn bạn!`
    };

    await transporter.sendMail(mailOptions);
};