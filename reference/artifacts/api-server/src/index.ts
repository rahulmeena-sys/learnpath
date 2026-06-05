// Validate environment first, before anything that reads it (db, logger).
import { config } from "./lib/config";
import app from "./app";
import { logger } from "./lib/logger";

const port = config.PORT;

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
