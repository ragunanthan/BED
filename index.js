import express from "express";
import helmet from "helmet";
import 'dotenv/config';

import authRoutes from "./src/Routes/authRoutes.js";
import { dbConnection } from "./src/dbConnection.js";

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


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`
🚀 Server ready at: ${port}`);

  dbConnection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
});
