import jwt from "jsonwebtoken"

export const getTokenRegistration =(user)=>jwt.sign({code:user},"SECRET KEY DIFFERENT FROM LOGIN XD",{ expiresIn : '48h'})
export const getTokenLogin =(user)=>jwt.sign(user,"ANOTHER SECRET KEY FOR LOGIN XD",{max:'48h'})
export const isAuth = (req,res,next)=>{
    const token = req.headers.authorization;
    console.log(token);
    if(token){
  
      const onlyToken =token.slice(7,token.length)
      jwt.verify(onlyToken,config.JWT_SECRET,(err,decode)=>{
        if(err){
          return res.status(401).send({msg:'invalid Token'})
        }
        req.user = decode;
        next();
        return
      })
    }
    return res.status(401).send({msg:'Token is not supplied'})
  }