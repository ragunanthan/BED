import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  signUpBodyValidation,
  logInBodyValidation,
  refreshTokenBodyValidation,
} from "../utils/validationSchema.js";
import authService from "../services/authService.js";

const {
  generateAccessToken,
  generateRefreshToken,
  getUser,
  deleteExistingToken,
  getToken,
  saveRefreshToken,
  saveUser,
} = authService();

const signUp = async (req, res) => {
  try {
    const { error } = signUpBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    const { success } = await getUser(req.body.email);
    if (success)
      return res
        .status(400)
        .json({ error: true, message: "User with given email already exist" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const { success: saved } = await saveUser(
      req.body.userName,
      req.body.email,
      hashPassword
    );
    if (saved)
      res.status(201).json({
        success: true,
        error: false,
        message: "Account created sucessfully",
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const generateTokens = async (userData) => {
  try {
    const payload = { _id: userData.id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await deleteExistingToken(userData.id);
    await saveRefreshToken(userData.id, refreshToken);
    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    return Promise.reject(err);
  }
};

const login = async (req, res) => {
  try {
    const { error } = logInBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    const { success, user } = await getUser(req.body.email);
    if (!success)
      return res.status(401).json({ error: true, message: "Invalid Username" });
    const verifiedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!verifiedPassword)
      return res.status(401).json({ error: true, message: "Invalid password" });
    const { accessToken, refreshToken } = await generateTokens(user);
    res.status(200).json({
      error: false,
      message: "Logged in sucessfully",
      data: {
        accessToken,
        refreshToken,
        userId: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    const { error } = refreshTokenBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    let deleted = await deleteExistingToken(req.body.userId);
    if (deleted)
      res.status(200).json({ error: false, message: "Logged Out Sucessfully" });
    else res.status(500).json({ error: false, message: "Error while logout" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const verifyRefreshToken = (userId, refreshToken) => {
  const privateKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;

  return new Promise(async (resolve, reject) => {
    const { success, token } = await getToken(userId);

    if (!success)
      return reject({ error: true, message: "Invalid refresh token" });

    jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
      if (err) return reject({ error: true, message: "Invalid refresh token" });
      resolve({
        tokenDetails,
        error: false,
        message: "Valid refresh token",
      });
    });
  });
};

const refershToken = async (req, res) => {
  const { error } = refreshTokenBodyValidation(req.body);
  if (error)
    return res
      .status(400)
      .json({ error: true, message: error.details[0].message });

  verifyRefreshToken(req.body.userId, req.body.refreshToken)
    .then(({ tokenDetails }) => {
      const payload = { _id: tokenDetails._id, isAdmin: tokenDetails.isAdmin };
      const accessToken = generateAccessToken(payload);
      res.status(200).json({
        error: false,
        accessToken,
        message: "Access token created successfully",
      });
    })
    .catch((err) => res.status(400).json(err));
};
export { signUp, login, logout, refershToken };
