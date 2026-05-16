import express from "express"
import { authenticate } from "../Middleware/auth.js";
import { login, profileDetailsController, register} from "../Controllers/userController.js";
export const userRoutes = express.Router();

userRoutes.post("/login",  login);
userRoutes.post("/register", register);

userRoutes.get("/verifyLogin", authenticate, (req, res) => {
    res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    })
});

userRoutes.get("/getProfileDetails", authenticate, profileDetailsController);

