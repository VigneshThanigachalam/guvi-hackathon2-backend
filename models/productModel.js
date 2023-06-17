import * as mongoose from "mongoose";


var productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim:true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type:String,
            required:true,
        },
        quantity:{
            type:Number,
            required:true,
        },
        sold:{
            type: Number,
            default:0,
            select:false,
        },
        image:{
            url: String,
        },
    },
    { timestamps: true }
);


//Export the model
export const productModel = mongoose.model("Product", productSchema);