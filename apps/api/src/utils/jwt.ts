import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";


export interface jwtPayload {
    userId: string;
    systemRole: "admin" | "member"
}



export function generateAccessToken(
    userId: string,
    systemRole: "admin" | "member"
) {
    return jwt.sign(
        { 
            userId,
            systemRole
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: "1d",
        }
    );
}


export function generateRefreshToken(userId: string) {
    return jwt.sign(
        { userId },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    );
}


export function verifyRefreshToken(token: string) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as {userId: string};
}