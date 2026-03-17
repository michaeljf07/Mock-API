import { Router } from "express";
import type { DataStore } from "../store/dataStore.js";

// parseQueryInt(value) parses the given value as an integer
// returns: value as an int if valid, undefined otherwise
function parseQueryInt(value: unknown): number | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
}

// buildRouter(collection, store) builds a router for the given collection and store
// returns: the router
// example: "users" -> "/users"
//          "posts" -> "/posts"
//          "comments" -> "/comments"
//          "products" -> "/products"
//          "orders" -> "/orders"
export function buildRouter(collection: string, store: DataStore): Router {
    const router = Router();

    // GET /: paginated list of items
    router.get("/", (req, res): void => {
        const page = parseQueryInt(req.query["page"]);
        const limit = parseQueryInt(req.query["limit"]);

        const data = store.getAll(collection, page, limit);
        const total = store.count(collection);

        res.json({ data, total, page: page ?? 1, limit: limit ?? total });
    });

    // GET /:id: get an item by id
    router.get("/:id", (req, res): void => {
        const id = req.params["id"] as string;
        const item = store.getById(collection, id);

        if (item === undefined) {
            res.status(404).json({ error: "Not found" });
            return;
        }

        res.json(item);
    });

    // POST /: create a new item
    router.post("/", (req, res): void => {
        const body = req.body as Record<string, unknown>;
        const item = store.create(collection, body);
        res.status(201).json(item);
    });

    // PUT /:id: update an item by id
    router.put("/:id", (req, res): void => {
        const id = req.params["id"] as string;
        const body = req.body as Record<string, unknown>;
        const item = store.update(collection, id, body);

        if (item === undefined) {
            res.status(404).json({ error: "Not found" });
            return;
        }

        res.json(item);
    });

    // PATCH /:id: update an item by id
    router.patch("/:id", (req, res): void => {
        const id = req.params["id"] as string;
        const body = req.body as Record<string, unknown>;
        const item = store.patch(collection, id, body);

        if (item === undefined) {
            res.status(404).json({ error: "Not found" });
            return;
        }

        res.json(item);
    });

    // DELETE /:id: delete an item by id
    router.delete("/:id", (req, res): void => {
        const id = req.params["id"] as string;
        const deleted = store.delete(collection, id);

        if (!deleted) {
            res.status(404).json({ error: "Not found" });
            return;
        }

        res.status(204).send();
    });

    return router;
}
