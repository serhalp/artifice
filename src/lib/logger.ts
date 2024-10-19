import createLogger from "pino";

const logger = createLogger({
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
        target: "pino-pretty",
      },
});

export default logger;
