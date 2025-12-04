import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

// Cấu hình dotenv để đọc các biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan("dev")); // Ghi log các request
app.use(express.json()); // Parse JSON request body
app.use(cors()); // Cho phép Cross-Origin Resource Sharing

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
