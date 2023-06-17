import asyncHandler from "express-async-handler";
import Razorpay from "razorpay";
import crypto from "crypto";
import { error } from "console";
import { userModel as user } from "../models/userModel.js";


export const productOrder = asyncHandler(async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET
        });
        const { id } = req.user;
        const { cart } = await user.findById({ _id: id });
        const totalPrice = cart.reduce((total, item) => total + item.totalPrice, 0);
        const options = {
            amount: totalPrice * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex")
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({
                    message: "something went wrong"
                });
            }
            res.status(200).json({ data: order });
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// payment verify 
export const verify = asyncHandler(async (req, res) => {
    try {
        const { razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", "keorgdBJocjmirlMmpV7KeEs").update(sign.toString()).digest("hex");
        if (razorpay_signature === expectedSign) {
            const { id } = req.user;
            const { cart } = await user.findByIdAndUpdate({ _id: id }, { cart: [] });
            const userDetails = await user.findByIdAndUpdate({ _id: id }, { $push: { rented: cart } });
            return res.status(200).json({ message: "payment verified successfully" });
        } else {
            return res.status(200).json({ message: "invalid signature sent" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
})