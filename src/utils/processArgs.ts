import { Command } from "commander";
import type { MockApiOptions } from "../types.js";

// processArgs(argv) processes the given arguments and returns the options
// retunrs: object with schema paths, port, and count
export function processArgs(argv: string[]): MockApiOptions {
    const program = new Command();

    program
        .name("mock-api")
        .description("Generate a mock REST API from TypeScript interfaces")
        .argument("<schemas...>", "TypeScript schema file path(s)")
        .option("-p, --port <number>", "Port to run the server on", "3000")
        .option(
            "-c, --count <number>",
            "Number of mock items to generate per collection",
            "10"
        )
        .parse(argv);

    // Get the schema paths and options from the program
    const schemaPaths = program.args;
    // Get the port and count options from the program
    const opts = program.opts<{ port: string; count: string }>();

    const port = parseInt(opts.port, 10);
    const count = parseInt(opts.count, 10);

    if (schemaPaths.length === 0) {
        console.error("Error: At least one schema file is required");
        process.exit(1);
    }

    if (isNaN(port) || port < 1 || port > 65535) {
        console.error("Error: Port must be a number between 1 and 65535");
        process.exit(1);
    }

    if (isNaN(count) || count < 1) {
        console.error("Error: Count must be a positive integer");
        process.exit(1);
    }

    return { schemaPaths, port, count };
}
