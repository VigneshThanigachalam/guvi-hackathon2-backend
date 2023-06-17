import jwt from "jsonwebtoken";

export const generaterrefreshToken= (id)=>{
    return jwt.sign({id},process.env.jwt_secret,{expiresIn:"3d"});
}
