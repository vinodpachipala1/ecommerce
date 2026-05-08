import jwt from "jsonwebtoken"
export const authenticate = (req, res, next)=>{
    
    const authHeader = req.headers["authorization"];
   
    const token = authHeader && authHeader.split(" ")[1];
    
    if(!token) {
        
        return res.status(401).json({ error : "Not Logged In"});
    }
    try{
        const decoded = jwt.verify(token,process.env.Security_String)
        req.user = decoded;
        next();
    } catch (err){
        console.log(err)
        return res.status(401).json("Invalid Token");
    }
}