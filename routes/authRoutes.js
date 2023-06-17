import express from "express";

import {
    createUser,
    loginUserCtrl,
    logOut,
    forgetPasswordtoken,
    updatepassword,
    resetPassword,
    validateToken,
    getCart,
    addCart,
    getCartItem,
    updateCartItem,
    queryMessage,
    updateAddress,
    getUserDetails
} from "../Controller/userController.js";

import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

export const router = express.Router();
router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.put("/updateCartItem", authMiddleware, updateCartItem);
router.put("/updateAddress", authMiddleware, updateAddress);
router.put("/password", authMiddleware, updatepassword);
router.post("/forget-password", forgetPasswordtoken);
router.put("/reset-password", resetPassword);
router.post("/validateToken", authMiddleware, validateToken);
router.put("/log-out", authMiddleware, logOut);
router.get("/getCart", authMiddleware, getCart);
router.get("/getUserDetails", authMiddleware, getUserDetails);
router.get("/getCartItem", authMiddleware, getCartItem);
router.post("/addCart", authMiddleware, addCart);
router.post("/queryMessage", authMiddleware, queryMessage);
