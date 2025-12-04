import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import { pool, testConnection } from "./config/db.js";
import { arcjetMiddleware } from "./lib/arcjet.js";

// Cấu hình dotenv để đọc các biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Bảo mật HTTP headers
app.use(morgan("dev")); // Ghi log các request
app.use(express.json()); // Parse JSON request body
app.use(cors()); // Cho phép Cross-Origin Resource Sharing

// Middleware bảo mật Arcjet - áp dụng trước các routes
app.use(arcjetMiddleware);

// Routes
app.use("/api/products", productRoutes); // Định tuyến cho các endpoint sản phẩm

// Hàm khởi tạo database
const initializeDatabase = async () => {
  try {
    // Kiểm tra kết nối database trước khi khởi tạo
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error("Không thể kết nối đến database");
    }

    // Tạo bảng products nếu chưa tồn tại
    // IF NOT EXISTS đảm bảo câu lệnh không gây lỗi nếu bảng đã tồn tại
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Thực thi câu lệnh tạo bảng
    await pool.query({ text: createTableQuery, values: [] });
    console.log("✅ Khởi tạo database thành công! Bảng products đã sẵn sàng.");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khởi tạo database:", error.message);
    return false;
  }
};

// Hàm khởi động server
const startServer = async () => {
  try {
    // Khởi tạo database trước khi khởi động server
    const isInitialized = await initializeDatabase();

    if (!isInitialized) {
      console.error("❌ Không thể khởi động server do lỗi khởi tạo database");
      process.exit(1); // Thoát ứng dụng với mã lỗi
    }

    // Chỉ khởi động server sau khi database đã được khởi tạo thành công
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khởi động server:", error.message);
    process.exit(1);
  }
};

// Khởi động ứng dụng
startServer();
