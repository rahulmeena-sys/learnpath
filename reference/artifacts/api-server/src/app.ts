import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { config } from "./lib/config";
import { notFound, errorHandler } from "./middlewares/error";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(config.corsOrigins ? { origin: config.corsOrigins } : undefined));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// 404 + central error handler must come after routes.
app.use(notFound);
app.use(errorHandler);

export default app;
