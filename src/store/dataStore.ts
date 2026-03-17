import { randomUUID } from "node:crypto";

type MockRecord = Record<string, unknown> & { id: string };

export class DataStore {
    private readonly collections: Map<string, MockRecord[]> = new Map();

    // seed(collection, items) seeds the collection with the given items
    //   adds the items to the collection
    seed(collection: string, items: Record<string, unknown>[]): void {
        const records = items.map(
            (item): MockRecord => ({ id: randomUUID(), ...item }) as MockRecord
        );
        this.collections.set(collection, records);
    }

    // count(collection) counts the number of items in the collection
    // returns: the number of items in the collection
    count(collection: string): number {
        return this.collections.get(collection)?.length ?? 0;
    }

    // getAll(collection, page, limit) gets all items from the collection
    // returns: a slice of the collection based on the page and limit
    getAll(collection: string, page?: number, limit?: number): MockRecord[] {
        const items = this.collections.get(collection) ?? [];
        if (page !== undefined && limit !== undefined) {
            const start = (page - 1) * limit;
            return items.slice(start, start + limit);
        }
        return items;
    }

    // getById(collection, id) gets an item from the collection by id
    // returns: the item if it exists, undefined otherwise
    getById(collection: string, id: string): MockRecord | undefined {
        return this.collections.get(collection)?.find((item) => item.id === id);
    }

    // create(collection, data) creates a new item in the collection
    // returns: the created item
    create(collection: string, data: Record<string, unknown>): MockRecord {
        const record: MockRecord = { id: randomUUID(), ...data } as MockRecord;
        const existing = this.collections.get(collection) ?? [];
        this.collections.set(collection, [...existing, record]);
        return record;
    }

    // update(collection, id, data) updates an item in the collection
    // returns: the updated item if it exists, undefined otherwise
    update(
        collection: string,
        id: string,
        data: Record<string, unknown>
    ): MockRecord | undefined {
        const items = this.collections.get(collection);
        if (items === undefined) return undefined;

        const exists = items.some((item) => item.id === id);
        if (!exists) return undefined;

        const updated: MockRecord = { id, ...data } as MockRecord;
        this.collections.set(
            collection,
            items.map((item) => (item.id === id ? updated : item))
        );
        return updated;
    }

    // patch(collection, id, data) partially updates an item in the collection
    // returns: the updated item if it exists, undefined otherwise
    patch(
        collection: string,
        id: string,
        data: Record<string, unknown>
    ): MockRecord | undefined {
        const items = this.collections.get(collection);
        if (items === undefined) return undefined;

        const existing = items.find((item) => item.id === id);
        if (existing === undefined) return undefined;

        const updated: MockRecord = { ...existing, ...data, id } as MockRecord;
        this.collections.set(
            collection,
            items.map((item) => (item.id === id ? updated : item))
        );
        return updated;
    }

    // delete(collection, id) deletes an item from the collection
    // returns: true if the item was deleted, false otherwise
    delete(collection: string, id: string): boolean {
        const items = this.collections.get(collection);
        if (items === undefined) return false;

        const exists = items.some((item) => item.id === id);
        if (!exists) return false;

        this.collections.set(
            collection,
            items.filter((item) => item.id !== id)
        );
        return true;
    }
}
