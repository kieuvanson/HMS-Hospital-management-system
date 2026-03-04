import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User_Model.js';

dotenv.config();

const migrateAvatarPaths = async () => {
  try {
    // Kết nối DB
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Xóa avatarUrl cũ (đường dẫn /uploads/avatars/) vì file đã bị xóa
    const deleteOldResult = await User.updateMany(
      { 
        avatarUrl: { $regex: '^/uploads/avatars/' }
      },
      { $set: { avatarUrl: null } }
    );

    console.log(`✅ Xóa ${deleteOldResult.modifiedCount} avatar cũ`);

    // Hiển thị tất cả users có avatar
    const users = await User.find({ avatarUrl: { $exists: true, $ne: null } }).select('name role avatarUrl');
    console.log('\n=== Danh sách avatarUrl sau migration ===');
    users.forEach(user => {
      console.log(`${user.name} (${user.role}): ${user.avatarUrl}`);
    });

    await connection.disconnect();
    console.log('\n✅ Migration hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

migrateAvatarPaths();
