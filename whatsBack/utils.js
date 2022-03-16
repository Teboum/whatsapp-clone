import jwt from "jsonwebtoken";

const SECRET1 = "SECRET KEY DIFFERENT FROM LOGIN XD";
const SECRET2 = "ANOTHER SECRET KEY FOR LOGIN XD";
export const getTokenRegistration = (user) =>
  jwt.sign({ code: user }, SECRET1, { expiresIn: "48h" });
export const getTokenLogin = (user) =>
  jwt.sign(user, SECRET2, { expiresIn: "48h" });
export function isCode(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    const onlyToken = token.slice(7, token.length);
    jwt.verify(onlyToken, SECRET1, (err, decode) => {
      if (err) {
        return res.status(401).json({ error: "invalid Token" });
      }
      req.user = decode.code;
      return next();
    });
  } else return res.status(401).json({ error: "Token is not supplied" });
}

export function isLogin(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    const onlyToken = token.slice(7, token.length);
    jwt.verify(onlyToken, SECRET2, (err, decode) => {
      if (err) {
        return res.status(401).json({ error: "invalid Token" });
      }

      req.user = decode;
      return next();
    });
  } else return res.status(401).json({ error: "Token is not supplied" });
}
