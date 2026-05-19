import Fastify from "fastify";
import cors from "@fastify/cors";
import { PORT } from "./config";
import { processAndRelayTransaction } from "./services/relayer";

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "http://localhost:3000",
});

fastify.post<{ Body: { intentXdr: string } }>("/api/relay", async (request, reply) => {
  try {
    const { intentXdr } = request.body;
    if (!intentXdr) {
      return reply.status(400).send({
        error: "MISSING_XDR",
        message: "intentXdr is required in request body",
      });
    }

    const transactionHash = await processAndRelayTransaction(intentXdr);

    return reply.send({
      success: true,
      hash: transactionHash,
    });
  } catch (error) {
    fastify.log.error(error);

    let errorMessage = "Internal server error";
    let errorCode = "INTERNAL_ERROR";

    if (error instanceof Error) {
      errorMessage = error.message;
      switch (error.message) {
        case "MALFORMED_XDR":
        case "SENDER_ACCOUNT_NOT_FOUND":
        case "RESERVE_VIOLATION":
        case "INSUFFICIENT_FUNDS":
          errorCode = error.message;
          break;
      }
    }

    return reply.status(400).send({
      error: errorCode,
      message: errorMessage,
    });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`GasRelay Engine running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
