import mongoose from "mongoose";

const getMongoUri = () => {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL ||
    ""
  ).trim();
};

export const connectDB = async () => {
  try {
    const mongoUri = getMongoUri();
    if (!mongoUri) {
      throw new Error(
        "Missing MongoDB URI. Set one of: MONGODB_URI, MONGO_URI, MONGO_URL, DATABASE_URL"
      );
    }

    await mongoose.connect(mongoUri);
    console.log("Kết nối đến MongoDB thành công");
  } catch (error) {
    console.error("Lỗi kết nối đến MongoDB:", error);
    process.exit(1);
  }
}