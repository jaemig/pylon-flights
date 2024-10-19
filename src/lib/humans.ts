import { and, eq, like, SQL } from "drizzle-orm";
import { ServiceError } from "@getcronit/pylon";

import getDb from "../db";
import { humans } from "../db/schema";

/**
 * Get humans
 * @param take  The number of humans to take
 * @param skip  The number of humans to skip
 * @returns     Array of humans
 */
export async function getHumans(firstname?: string, lastname?: string, birthdate?: string, take?: number, skip?: number) {
    if ((take !== undefined && take < 0) || (skip !== undefined && skip < 0)) {
        throw new ServiceError('Invalid pagination', {
            statusCode: 400,
            code: 'invalid_pagination',
            details: {
                take,
                skip
            }
        });
    }

    const conditions: SQL[] = [];

    if (firstname) conditions.push(like(humans.firstname, `${firstname.trim().toLocaleLowerCase()}%`));
    if (lastname) conditions.push(like(humans.lastname, `${lastname.trim().toLocaleLowerCase()}%`));
    if (birthdate) conditions.push(like(humans.birthdate, `${birthdate.trim().toLocaleLowerCase()}%`));

    try {
        return await getDb().query.humans.findMany({
            limit: take ?? 20,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined, // Use `and` only if there are conditions
        });
    } catch {
        throw new ServiceError('Failed to get humans', {
            statusCode: 400,
            code: 'db_error',
        });
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
        throw new ServiceError('Failed to get human', {
            statusCode: 400,
            code: 'db_error',
        });
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
    const birthdateParts = birthdate.split('-');
    if (birthdateParts.length !== 3 || birthdateParts[0].length !== 4 || birthdateParts[1].length !== 2 || birthdateParts[2].length !== 2) {
        throw new ServiceError('Invalid birthdate', {
            statusCode: 400,
            code: 'invalid_birthdate',
            details: {
                birthdate,
                format: 'YYYY-MM-DD'
            }
        });
    }

    const firstnameInput = firstname.trim();
    if (firstnameInput.length === 0) {
        throw new ServiceError('First name is required', {
            statusCode: 400,
            code: 'missing_firstname',
        });
    }

    const lastnameInput = lastname.trim();
    if (lastnameInput.length === 0) {
        throw new ServiceError('Last name is required', {
            statusCode: 400,
            code: 'missing_lastname',
        });
    }


    try {
        const [human] = await getDb()
            .insert(humans)
            .values({
                firstname: firstnameInput,
                lastname: lastnameInput,
                birthdate
            })
            .returning();
        return human;
    } catch {
        throw new ServiceError('Failed to add human', {
            statusCode: 400,
            code: 'db_error',
        });
    }

}

export async function updateHuman(id: number, firstname?: string, lastname?: string, birthdate?: string) {
    const existingHuman = await getHumanById(id);

    if (!existingHuman) {
        throw new ServiceError('Human does not exist', {
            statusCode: 400,
            code: 'human_does_not_exist',
            details: {
                id
            }
        });
    }

    if (birthdate) {
        const birthdateParts = birthdate.split('-');

        if (birthdateParts.length !== 3 || birthdateParts[0].length !== 4 || birthdateParts[1].length !== 2 || birthdateParts[2].length !== 2) {
            throw new ServiceError('Invalid birthdate', {
                statusCode: 400,
                code: 'invalid_birthdate',
                details: {
                    birthdate,
                    format: 'YYYY-MM-DD'
                }
            });
        }

    }

    try {
        const [human] = await getDb()
            .update(humans)
            .set({
                firstname,
                lastname,
                birthdate
            })
            .where(eq(humans.id, id))
            .returning();

        return human;
    } catch {
        throw new ServiceError('Failed to update human', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Delete a human
 * @param id    The id of the human
 * @returns     The deleted human  
 */
export async function deleteHuman(id: number) {

    const existingHuman = await getHumanById(id);

    if (!existingHuman) {
        throw new ServiceError('Human does not exist', {
            statusCode: 400,
            code: 'human_does_not_exist',
            details: {
                id
            }
        });
    }
    try {
        const [human] = await getDb()
            .delete(humans)
            .where(eq(humans.id, id))
            .returning();

        return human;
    } catch {
        throw new ServiceError('Failed to delete human', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}