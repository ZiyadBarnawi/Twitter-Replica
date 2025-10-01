import jwt from "jsonwebtoken";
import { OperationalErrors } from "../Utils/operationalErrors.js";

export const generateJwt = (user, options = { expiresIn: "90DAYS" }) => {
  if (!user.role) throw new OperationalErrors("There was an issue while issuing the token", 404);
  if (!user.username)
    throw new OperationalErrors("There was an issue while issuing the token", 404);
  if (!user.id) throw new OperationalErrors("There was an issue while issuing the token", 404);
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: options.expiresIn,
    }
  );
};
