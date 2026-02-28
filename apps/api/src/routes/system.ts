import { FastifyPluginAsync } from "fastify";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const systemRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/system/update", async (request, reply) => {
    // This endpoint triggers the update script.
    // In a real production app opening to the internet, this MUST be secured.
    // For a local home dashboard, it's acceptable but still good to know.

    fastify.log.info("System update triggered via API");

    // We don't wait for execution to finish because the container might get killed during rebuild.
    // We just spawn it detached.
    const scriptPath = path.resolve(__dirname, "../../../../scripts/update.sh");

    const child = exec(`sh ${scriptPath}`);

    child.stdout?.on("data", (data) =>
      fastify.log.info(`Update script stdout: ${data}`),
    );
    child.stderr?.on("data", (data) =>
      fastify.log.error(`Update script stderr: ${data}`),
    );

    child.on("close", (code) => {
      fastify.log.info(`Update script exited with code ${code}`);
    });

    return reply.send({
      success: true,
      message: "Update initiated. System may restart shortly.",
    });
  });
};
