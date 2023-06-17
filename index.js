import bodyParser from "body-parser";
import express from "express";
import { db_connect } from "./config/db_connect.js";
import cors from "cors"

import { router } from "./routes/authRoutes.js";
import cookieparser from "cookie-parser";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { productRoute } from "./routes/productRoutes.js";
import * as dotenv from "dotenv";
import { paymentRoute } from "./routes/paymentRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

db_connect();

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieparser());
app.get("/", (req, res) => {
    res.send("hello word")
});
app.use("/api/user", router);
app.use("/api/product", productRoute);
app.use("/api/payment", paymentRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`server running at ${port}`);
});
