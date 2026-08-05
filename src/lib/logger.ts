import createLogger from "pino";

const logger = createLogger({
  transport: import.meta.env.DEV
    ? {
        target: "pino-pretty",
      }
    : undefined,
});

export default logger;
