import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        // accept token from cookie or Authorization header
        const authHeader = req.headers.authorization || req.headers['authorization'];
        const token = req.cookies?.accessToken || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null);
        if (!token) {
             throw new ApiError(401, "Access token is required");   
           }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user= await User.findById(decoded?._id).select("-password -refreshtoken")
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        console.log("Cookies:", req.cookies);
       console.log("Headers:", req.headers);
        console.log("Token:", token);

        next();
       } catch (error) {
        next(error);
    }
   
})