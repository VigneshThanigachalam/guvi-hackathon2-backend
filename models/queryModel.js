import * as mongoose from "mongoose";


var querySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        mobile: {
            type: Number,
            required: true,
        },
        email: {
            type:String,
            required:true,
        },
        query:{
            type:String,
            required:true,
        }
    },
    { timestamps: true }
);


//Export the model
export const queryModel = mongoose.model("Query", querySchema);