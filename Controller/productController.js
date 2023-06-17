import { productModel as Product } from "../models/productModel.js";
import asyncHandler from "express-async-handler";
import json from "body-parser";
import { Error } from "mongoose";
import fs from "fs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

export const addProduct = asyncHandler(async (req, res) => {
    try {
        const { title, description, price, category, quantity } = req.body;
        const { image } = req.files;
        const newProduct = await Product.create({
            title,
            description,
            price,
            category,
            quantity,
            image: {
                url: image[0].path
            }
        });
        res.json(newProduct);
    } catch (err) {
        throw new Error(err);
    }
});

export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const { image } = req.files;
        req.body.image = { url: image[0].path }

        const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
            new: true,
        });

        res.json(updateProduct);
    } catch (err) {
        throw new Error(err);
    }
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteProduct = await Product.findOneAndDelete({ _id: id });
        res.json(deleteProduct);
    } catch (err) {
        throw new Error(err);
    }
});

export const getaproduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (err) {
        throw new Error(err);
    }
});

export const getProducts = asyncHandler(async (req, res) => {
    try {
        const { query } = req.params;
        const createQuery = (query == "null") ? {} : { category: query };
        const product = await Product.find(createQuery);
        res.json(product);
    } catch (err) {
        throw new Error(err);
    }
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, res) => `ERental/${req.user.id}`,
    },
});

export const upload = multer({ storage: storage }).fields([
    { name: "image" }
]);