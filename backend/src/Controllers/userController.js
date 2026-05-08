import { loginUser, profileDetailsService } from "../Services/userService.js";

import axios from "axios";


export const login = async (req, res) => {
    
    try {

        const { email, password } = req.body.log;
        const userType = req.body.userType;
        const result = await loginUser(email, password, userType);
        res.status(200).json(result);

    } catch (error) {

        res.status(500).json({ message: error.message });
        
    }
}

export const profileDetailsController = async(req, res) => {
    try {
        const result = await profileDetailsService(req.user.id, req.user.email);
        res.status(200).json({profileDetails : result, user : req.user});
    } catch (err) {
        res.status(500).json({message : err.message});
    }
}