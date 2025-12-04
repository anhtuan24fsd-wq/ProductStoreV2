import { pool } from "../config/db.js";

// Controller chứa các hàm xử lý logic cho sản phẩm

// Lấy tất cả sản phẩm
export const getAllProducts = async (req, res) => {
  try {
    // Câu lệnh SQL: SELECT * FROM products - Lấy tất cả các cột từ bảng products
    const text = "SELECT * FROM products ORDER BY created_at DESC";
    const result = await pool.query({ text, values: [] });

    // Trả về danh sách sản phẩm với mã trạng thái 200 (OK)
    res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};

// Tạo sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const { name, price, image } = req.body;

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!name || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin: name, price, image",
      });
    }

    // Kiểm tra giá phải là số dương
    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá sản phẩm phải là số dương",
      });
    }

    // Câu lệnh SQL: INSERT INTO products - Thêm sản phẩm mới vào bảng
    // RETURNING * - Trả về toàn bộ bản ghi vừa được thêm vào
    const text =
      "INSERT INTO products (name, price, image) VALUES ($1, $2, $3) RETURNING *";
    const values = [name, parseFloat(price), image];
    const result = await pool.query({ text, values });

    // Trả về sản phẩm vừa tạo với mã trạng thái 201 (Created)
    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm mới thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo sản phẩm",
      error: error.message,
    });
  }
};

// Lấy một sản phẩm theo ID
export const getProduct = async (req, res) => {
  try {
    // Lấy ID từ URL parameters (req.params)
    const { id } = req.params;

    // Kiểm tra ID có phải là số hợp lệ không
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // Câu lệnh SQL: SELECT * FROM products WHERE id = $1
    // $1 là placeholder cho giá trị ID để tránh SQL injection
    const text = "SELECT * FROM products WHERE id = $1";
    const values = [parseInt(id)];
    const result = await pool.query({ text, values });

    // Kiểm tra xem có tìm thấy sản phẩm không
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Trả về sản phẩm với mã trạng thái 200 (OK)
    res.status(200).json({
      success: true,
      message: "Lấy thông tin sản phẩm thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin sản phẩm",
      error: error.message,
    });
  }
};

// Cập nhật sản phẩm theo ID
export const updateProduct = async (req, res) => {
  try {
    // Lấy ID từ URL parameters
    const { id } = req.params;
    // Lấy dữ liệu cần cập nhật từ request body
    const { name, price, image } = req.body;

    // Kiểm tra ID có phải là số hợp lệ không
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // Kiểm tra ít nhất một trường cần được cập nhật
    if (!name && !price && !image) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
      });
    }

    // Kiểm tra giá nếu được cung cấp
    if (price && (isNaN(price) || parseFloat(price) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Giá sản phẩm phải là số dương",
      });
    }

    // Xây dựng câu lệnh UPDATE động dựa trên các trường được cung cấp
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (price) {
      updateFields.push(`price = $${paramCount}`);
      values.push(parseFloat(price));
      paramCount++;
    }

    if (image) {
      updateFields.push(`image = $${paramCount}`);
      values.push(image);
      paramCount++;
    }

    // Thêm ID vào cuối mảng values
    values.push(parseInt(id));

    // Câu lệnh SQL: UPDATE products SET ... WHERE id = $n
    // RETURNING * - Trả về bản ghi sau khi được cập nhật
    const text = `UPDATE products SET ${updateFields.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query({ text, values });

    // Kiểm tra xem có tìm thấy và cập nhật sản phẩm không
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để cập nhật",
      });
    }

    // Trả về sản phẩm đã cập nhật với mã trạng thái 200 (OK)
    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật sản phẩm",
      error: error.message,
    });
  }
};

// Xóa sản phẩm theo ID
export const deleteProduct = async (req, res) => {
  try {
    // Lấy ID từ URL parameters
    const { id } = req.params;

    // Kiểm tra ID có phải là số hợp lệ không
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // Câu lệnh SQL: DELETE FROM products WHERE id = $1
    // RETURNING * - Trả về bản ghi vừa bị xóa
    const text = "DELETE FROM products WHERE id = $1 RETURNING *";
    const values = [parseInt(id)];
    const result = await pool.query({ text, values });

    // Kiểm tra xem có tìm thấy và xóa sản phẩm không
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để xóa",
      });
    }

    // Trả về thông tin sản phẩm đã xóa với mã trạng thái 200 (OK)
    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa sản phẩm",
      error: error.message,
    });
  }
};
