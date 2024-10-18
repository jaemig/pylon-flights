import { and, eq, SQL } from "drizzle-orm";
import getDb from "../db";
import { humans } from "../db/schema";

/**
 * Get humans
 * @param take  The number of humans to take
 * @param skip  The number of humans to skip
 * @returns     Array of humans
 */
export async function getHumans(firstname?: string, lastname?: string, birthdate?: string, take?: number, skip?: number) {
    try {
        const conditions: SQL[] = [];

        if (firstname) conditions.push(eq(humans.firstname, firstname.trim().toLocaleLowerCase()));
        if (lastname) conditions.push(eq(humans.lastname, lastname.trim().toLocaleLowerCase()));
        if (birthdate) conditions.push(eq(humans.birthdate, birthdate));

        return await getDb().query.humans.findMany({
            limit: take ?? 20,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined, // Use `and` only if there are conditions
        });
    } catch {
        return [];
    }
}

/**
 * Get human by id
 * @param id    The id of the human
 * @returns     The human or undefined if not found
 */
export async function getHumanById(id: number) {
    try {
        return await getDb().query.humans
            .findFirst({
                where: eq(humans.id, id)
            });
    } catch {
        return undefined;
    }
}

/**
 * Add a human
 * @param firstname     The first name of the human
 * @param lastname      The last name of the human
 * @param birthdate     The birthdate of the human
 * @returns             The added human
 */
export async function addHuman(firstname: string, lastname: string, birthdate: string) {
    try {
        const [human] = await getDb()
            .insert(humans)
            .values({
                firstname,
                lastname,
                birthdate
            })
            .returning();

        return human;
    } catch {
        return undefined;
    }
}

/**
 * Delete a human
 * @param id    The id of the human
 * @returns     The deleted human  
 */
export async function deleteHuman(id: number) {
    try {
        const [human] = await getDb()
            .delete(humans)
            .where(eq(humans.id, id))
            .returning();

        return human;
    } catch {
        return undefined;
    }
}