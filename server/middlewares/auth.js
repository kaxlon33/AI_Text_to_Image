import jwt from "jsonwebtoken";

export const auth = async (req , res , next) => {
    const {token} = req.headers;
    if(!token){
        res.json({
            success: false,
            message : "Token not found"
        })
    }

    try{
        const tokenDecode = jwt.verify(token , process.env.JWT_SECRET);
        if(tokenDecode.id){
            req.body.userId = tokenDecode.id
        }else{
            return res.json({
                success: false,
                message : "Not Authorized. Login Again"
            })
        }
        next();
    }catch(error){
        res.json({
            success: false,
            message : error.message
        })
    }
}