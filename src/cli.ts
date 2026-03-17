#!/usr/bin/env node
import { processArgs } from "./utils/processArgs.js";
import { startServer } from "./server.js";

const options = processArgs(process.argv);
startServer(options);
