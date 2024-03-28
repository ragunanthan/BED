import { Router } from "express";
import { login, signUp, logout, refershToken } from "../controllers/authController.js";


const router = Router();
router.get("/", async (req, res) => {
    res.send("Happy")
});
router.post("/signUp", signUp);
router.post("/logIn", login);
router.post("/logout", logout);
router.post("/refershToken", refershToken);

export default router;
