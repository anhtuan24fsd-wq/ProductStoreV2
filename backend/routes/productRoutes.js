import express from "express";
import {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Route lấy tất cả sản phẩm và tạo sản phẩm mới
router.get("/", getAllProducts); // GET /api/products
router.post("/", createProduct); // POST /api/products

// Route với ID động cho các thao tác CRUD trên sản phẩm cụ thể
router.get("/:id", getProduct); // GET /api/products/:id
router.put("/:id", updateProduct); // PUT /api/products/:id
router.delete("/:id", deleteProduct); // DELETE /api/products/:id

export default router;
