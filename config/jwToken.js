import jwt from "jsonwebtoken";

export const generateToken= (id)=>{
    return jwt.sign({id},process.env.jwt_secret,{expiresIn:"1d"});
}