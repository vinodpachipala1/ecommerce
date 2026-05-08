import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import { findUserByEmail, profileDetailsModule } from "../Modules/userModule.js";

export const loginUser = async(email, password, userType) => {
    
    const user = await findUserByEmail(email);
    
    if(!user) {
        throw new Error("Invalid credentials");
    }

    if(user.role != userType){
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        {id: user.id, role: user.role, email: user.email, name: user.name},
        process.env.Security_String,
        { expiresIn : "24h" },
    )

    return{
        message: "Login Succesful",
        token,
    }
    
}

export const profileDetailsService = async(userId, email) => {
    const profileDetails = await profileDetailsModule(userId, email);
    return profileDetails;
}