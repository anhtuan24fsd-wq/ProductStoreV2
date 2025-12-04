import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Cấu hình dotenv để đọc các biến môi trường
dotenv.config();

// Lấy các biến môi trường cho kết nối database
const pgHost = process.env.PGHOST;
const pgDatabase = process.env.PGDATABASE;
const pgUser = process.env.PGUSER;
const pgPassword = process.env.PGPASSWORD;
const pgPort = process.env.PGPORT || 5432;

// Tạo chuỗi kết nối PostgreSQL với SSL mode required
// Format: postgresql://username:password@host:port/database?sslmode=require
const connectionString = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require`;

// Tạo SQL function để thực hiện các truy vấn an toàn với tagged template literal
// Hàm này cho phép viết SQL queries với cú pháp: sql`SELECT * FROM table WHERE id = ${value}`
const sql = neon(connectionString);

// Tạo connection pool để quản lý nhiều kết nối đồng thời
// Pool giúp tối ưu hiệu suất bằng cách tái sử dụng các kết nối
const pool = new Pool({ connectionString });

// Hàm kiểm tra kết nối database
const testConnection = async () => {
  try {
    // Thực hiện một truy vấn đơn giản để kiểm tra kết nối
    const result = await sql`SELECT NOW() as current_time`;
    console.log("✅ Kết nối database thành công!");
    console.log("⏰ Thời gian server database:", result[0].current_time);
    return true;
  } catch (error) {
    console.error("❌ Lỗi kết nối database:", error.message);
    return false;
  }
};

// Xuất các đối tượng để sử dụng trong ứng dụng
export { sql, pool, testConnection };
