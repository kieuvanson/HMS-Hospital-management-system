import nodemailer from 'nodemailer';

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const formatDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return 'Không xác định';
    }

    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const canSendEmail = () => {
    return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

const sendMailSafely = async (mailOptions) => {
    if (!canSendEmail()) {
        console.warn('Email config thiếu EMAIL_USER hoặc EMAIL_PASS. Bỏ qua gửi email.');
        return;
    }

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
};

export const sendAppointmentConfirmation = async (email, appointment) => {
    if (!email) {
        console.warn('Không có email bệnh nhân, bỏ qua gửi xác nhận lịch hẹn.');
        return;
    }

    const doctorName = appointment?.doctorInfo?.name || 'Bác sĩ';
    const appointmentDate = formatDate(appointment?.appointmentDate);
    const appointmentTime = appointment?.appointmentTime || 'Không xác định';

    const mailOptions = {
        from: `"HSM Hospital" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Xác nhận đặt lịch hẹn thành công',
        text: `Xin chào,

Lịch hẹn của bạn đã được xác nhận:
- Bác sĩ: ${doctorName}
- Ngày: ${appointmentDate}
- Giờ: ${appointmentTime}

Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;padding:24px;">
            <div style="background:#0f766e;color:#fff;padding:18px 20px;border-radius:10px 10px 0 0;">
                <h2 style="margin:0;font-size:20px;">HSM Hospital</h2>
                <p style="margin:6px 0 0;font-size:14px;opacity:.95;">Xác nhận lịch hẹn khám bệnh</p>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;padding:20px;">
                <p style="margin:0 0 14px;color:#334155;">Xin chào, lịch hẹn của bạn đã được tạo thành công:</p>
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px 0;color:#64748b;">Bác sĩ</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${doctorName}</td></tr>
                    <tr><td style="padding:8px 0;color:#64748b;">Ngày khám</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${appointmentDate}</td></tr>
                    <tr><td style="padding:8px 0;color:#64748b;">Giờ khám</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${appointmentTime}</td></tr>
                </table>
                <p style="margin:14px 0 0;color:#475569;font-size:14px;">Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.</p>
            </div>
        </div>`
    };

    await sendMailSafely(mailOptions);
};

export const sendAppointmentReminder = async (email, appointment) => {
    if (!email) {
        console.warn('Không có email bệnh nhân, bỏ qua gửi nhắc lịch hẹn.');
        return;
    }

    const doctorName = appointment?.doctorInfo?.name || 'Bác sĩ';
    const appointmentDate = formatDate(appointment?.appointmentDate);
    const appointmentTime = appointment?.appointmentTime || 'Không xác định';

    const mailOptions = {
        from: `"HSM Hospital" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Nhắc nhở lịch hẹn',
        text: `Xin chào,

Đây là nhắc nhở về lịch hẹn sắp tới của bạn:
- Bác sĩ: ${doctorName}
- Ngày: ${appointmentDate}
- Giờ: ${appointmentTime}

Vui lòng đến đúng giờ. Cảm ơn bạn!`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;padding:24px;">
            <div style="background:#1d4ed8;color:#fff;padding:18px 20px;border-radius:10px 10px 0 0;">
                <h2 style="margin:0;font-size:20px;">HSM Hospital</h2>
                <p style="margin:6px 0 0;font-size:14px;opacity:.95;">Nhắc lịch hẹn khám bệnh</p>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;padding:20px;">
                <p style="margin:0 0 14px;color:#334155;">Đây là nhắc nhở về lịch hẹn sắp tới của bạn:</p>
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px 0;color:#64748b;">Bác sĩ</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${doctorName}</td></tr>
                    <tr><td style="padding:8px 0;color:#64748b;">Ngày khám</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${appointmentDate}</td></tr>
                    <tr><td style="padding:8px 0;color:#64748b;">Giờ khám</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${appointmentTime}</td></tr>
                </table>
                <p style="margin:14px 0 0;color:#475569;font-size:14px;">Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.</p>
            </div>
        </div>`
    };

    await sendMailSafely(mailOptions);
};