import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";
import dotenv from "dotenv";

// Cấu hình dotenv để đọc các biến môi trường từ file .env
dotenv.config();

// Khởi tạo Arcjet với khóa API từ biến môi trường
const aj = arcjet({
  // Lấy khóa API Arcjet từ biến môi trường
  key: process.env.ARCJET_KEY,

  // Cấu hình đặc điểm để theo dõi yêu cầu dựa trên địa chỉ IP nguồn
  characteristics: ["ip.src"],

  // Thiết lập các quy tắc bảo vệ
  rules: [
    // Shield: Bảo vệ khỏi các cuộc tấn công phổ biến (SQL injection, XSS, CSRF)
    shield({
      mode: "LIVE", // Chế độ LIVE để chặn các yêu cầu độc hại
    }),

    // DetectBot: Phát hiện và chặn các bot độc hại
    detectBot({
      mode: "LIVE", // Chế độ LIVE để chặn bot độc hại
      allow: ["CATEGORY:SEARCH_ENGINE"], // Cho phép các công cụ tìm kiếm truy cập
    }),

    // TokenBucket: Giới hạn tốc độ yêu cầu (Rate Limiting)
    tokenBucket({
      mode: "LIVE", // Chế độ LIVE để áp dụng giới hạn tốc độ
      refillRate: 5, // Nạp lại 5 token
      capacity: 10, // Dung lượng tối đa 10 token
      interval: 10, // Trong khoảng thời gian 10 giây
    }),
  ],
});

// Middleware bảo mật Arcjet
export const arcjetMiddleware = async (req, res, next) => {
  try {
    // Gọi hàm protect để kiểm tra yêu cầu, tiêu thụ 1 token
    const decision = await aj.protect(req, { requested: 1 });

    // Kiểm tra nếu yêu cầu bị từ chối
    if (decision.isDenied()) {
      // Kiểm tra lý do từ chối
      for (const result of decision.results) {
        // Kiểm tra nếu bị từ chối do vượt quá giới hạn tốc độ
        if (result.reason.isRateLimit()) {
          return res.status(429).json({
            success: false,
            message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
          });
        }

        // Kiểm tra nếu bị từ chối do phát hiện bot độc hại
        if (result.reason.isBot()) {
          return res.status(403).json({
            success: false,
            message: "Truy cập bị từ chối. Bot không được phép.",
          });
        }

        // Kiểm tra nếu phát hiện bot giả mạo (spoofed bot)
        if (result.isSpoofed && result.isSpoofed()) {
          return res.status(403).json({
            success: false,
            message: "Truy cập bị từ chối. Phát hiện bot giả mạo.",
          });
        }
      }

      // Nếu bị từ chối vì lý do khác
      return res.status(403).json({
        success: false,
        message: "Truy cập bị từ chối.",
      });
    }

    // Nếu yêu cầu được chấp nhận, tiếp tục xử lý
    next();
  } catch (error) {
    // Xử lý lỗi nếu có vấn đề với Arcjet
    console.error("Lỗi Arcjet middleware:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống bảo mật.",
    });
  }
};

export default aj;
