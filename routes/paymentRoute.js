import express from "express";


import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { productOrder, verify } from "../Controller/paymentController.js";

export const paymentRoute = express.Router();

paymentRoute.post("/product-order", authMiddleware, productOrder);
paymentRoute.post("/verify", authMiddleware, verify);

