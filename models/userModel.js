import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "user",
        },
        cart: {
            type: Array,
            default: [],
            unique: true
        },
        rented: {
            type: Array,
            default: [],
            unique: true
        },
        address:{
            flat:{
                type:String,
                default:""
            },
            street:{
                type:String,
                default:""
            },
            city:{
                type:String,
                default:""
            },
            pincode:{
                type:String,
                default:""
            },
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createpasswordResetToken = async function () {
    const resettoken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resettoken)
        .digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 min
    return resettoken;
};

//Export the model
export const userModel = mongoose.model("Users", userSchema);
