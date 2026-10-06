import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/authRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import deliveryRoutes from "./routes/deliveryRoute.js";
import serviceRoutes from "./routes/serviceRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";
import notFound from "./middleware/notFoundMiddleware.js";
import errorHandler from "./middleware/errorMiddleware.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openApiSpec = JSON.parse(
  readFileSync(path.join(__dirname, "saggwer.json"), "utf8"),
);

app.get("/api-docs", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Laundry Pickup API - Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => SwaggerUIBundle({ spec: ${JSON.stringify(openApiSpec)}, dom_id: "#swagger-ui" });
    </script>
  </body>
</html>`);
});

app.get("/saggwer.json", (req, res) => {
  res.sendFile(path.join(__dirname, "saggwer.json"));
});

app.use(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
  }),
);

// ========================
// GLOBAL MIDDLEWARE
// ========================

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// ========================
// ROUTES
// ========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Laundry Pickup API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ========================
// ERROR HANDLING
// ========================

app.use(notFound);

app.use(errorHandler);

export default app;
