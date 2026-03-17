import { resolve } from "node:path";
import express, { type Express } from "express";
import { Project } from "ts-morph";
import type { MockApiOptions } from "./types.js";
import { DataStore } from "./store/dataStore.js";
import { buildRouter } from "./router/routeBuilder.js";
import { generateMockCollection } from "./utils/mockGenerator.js";
import { toRoutePath, toCollectionKey } from "./utils/nameUtils.js";

// createServer(options) creates a new server with the given options
//   options: the options for the server
//   returns: the Express application (server)
export function createServer(options: MockApiOptions): Express {
    const app = express();
    const project = new Project({ skipAddingFilesFromTsConfig: true });
    const store = new DataStore();

    app.use(express.json());

    // Add the source files to the project
    for (const schemaPath of options.schemaPaths) {
        project.addSourceFilesAtPaths(resolve(schemaPath));
    }

    const interfaces = project
        .getSourceFiles()
        .flatMap((sf) => sf.getInterfaces());

    // If no interfaces are found, warn the user
    if (interfaces.length === 0) {
        console.warn(
            "Warning: No interfaces found in the provided schema files"
        );
    }

    const routes: Array<{ path: string; interface: string; count: number }> =
        [];

    // For each interface, generate mock data, build the router, and add the route to the server
    for (const iface of interfaces) {
        const name = iface.getName();
        const routePath = toRoutePath(name);
        const collectionKey = toCollectionKey(name);

        const mockData = generateMockCollection(iface, project, options.count);
        store.seed(collectionKey, mockData);

        const router = buildRouter(collectionKey, store);
        app.use(routePath, router);

        routes.push({ path: routePath, interface: name, count: options.count });
    }

    // Root route lists all available collections
    app.get("/", (_req, res): void => {
        res.json({
            message: "Mock API is running",
            routes: routes.map((r) => ({
                collection: r.path,
                interface: r.interface,
                seeded: r.count,
                endpoints: [
                    `GET ${r.path}`,
                    `GET ${r.path}/:id`,
                    `POST ${r.path}`,
                    `PUT ${r.path}/:id`,
                    `PATCH ${r.path}/:id`,
                    `DELETE ${r.path}/:id`,
                ],
            })),
        });
    });

    return app;
}

// startServer(options) starts the server with the given options
//   options: the options for the server
//   returns: void
export function startServer(options: MockApiOptions): void {
    const app = createServer(options);

    console.log("\nRegistering routes:");
    for (const schemaPath of options.schemaPaths) {
        console.log(`  Schema: ${schemaPath}`);
    }

    app.listen(options.port, () => {
        console.log(`\nMock API running at http://localhost:${options.port}`);
        console.log(
            `Visit http://localhost:${options.port}/ to see all routes`
        );
        console.log("Press Ctrl+C to stop\n");
    });
}
