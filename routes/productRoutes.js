import express from "express";

import {
    getProducts,
    updateProduct,
    deleteProduct,
    upload,
    addProduct,
    getaproduct,
} from "../Controller/productController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

export const productRoute = express.Router();

productRoute.post("/add", authMiddleware, isAdmin, upload, addProduct);
productRoute.get("/single/:id", authMiddleware, isAdmin, getaproduct);
productRoute.get("/:query", getProducts);
productRoute.put("/:id", authMiddleware, isAdmin, upload, updateProduct);
productRoute.delete("/:id", authMiddleware, isAdmin, deleteProduct);
