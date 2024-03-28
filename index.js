import express from "express";
import helmet from "helmet";
import authLib from "auth-lib-jwt";

import 'dotenv/config';

import authRoutes from "./src/Routes/authRoutes.js";
import { dbConnection } from "./src/dbConnection.js";
import authService from "./src/services/authService.js";

const {
  getUser,
  deleteExistingToken,
  getToken,
  saveRefreshToken,
  saveUser,
} = authService();

// Initialize authentication library
authLib.initialize({
  // Implement your own logic for these functions
  getUser,
  addToken : saveRefreshToken,
  getToken,
  saveUser,
  deleteExistingToken,
});


const app = express();
BigInt.prototype.toJSON = function () {
  return this.toString();
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());

// routers
app.use("/api", authRoutes);
app.use("/api/auth", authLib.getRoutes());


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`
🚀 Server ready at: ${port}`);

  dbConnection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
});
