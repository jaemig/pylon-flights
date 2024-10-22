import { and, eq, like, SQL } from 'drizzle-orm';
import { ServiceError } from '@getcronit/pylon';

import getDb from '../db';
import { Human, humans } from '../db/schema';
import { checkEditSecret, generateUUID, isValidUUID } from '../utilts';

/**
 * Get human by id
 * @param id    The id of the human
 * @returns     The human or undefined if not found
 */
export async function $getHumanById(id: number) {
    try {
        return await getDb().query.humans.findFirst({
            where: eq(humans.id, id),
        });
    } catch {
        throw new ServiceError('Failed to get human', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get humans
 * @param take  The number of humans to take
 * @param skip  The number of humans to skip
 * @returns     Array of humans
 */
export async function getHumans(
    firstname?: string,
    lastname?: string,
    birthdate?: string,
    take?: number,
    skip?: number,
) {
    if ((take !== undefined && take < 0) || (skip !== undefined && skip < 0)) {
        throw new ServiceError('Invalid pagination', {
            statusCode: 400,
            code: 'invalid_pagination',
            details: {
                take,
                skip,
            },
        });
    }

    const conditions: SQL[] = [];

    if (firstname)
        conditions.push(
            like(humans.firstname, `${firstname.trim().toLocaleLowerCase()}%`),
        );
    if (lastname)
        conditions.push(
            like(humans.lastname, `${lastname.trim().toLocaleLowerCase()}%`),
        );
    if (birthdate)
        conditions.push(
            like(humans.birthdate, `${birthdate.trim().toLocaleLowerCase()}%`),
        );

    try {
        return await getDb().query.humans.findMany({
            limit: take ?? 20,
            offset: skip,
            where: conditions.length > 0 ? and(...conditions) : undefined, // Use `and` only if there are conditions
            columns: {
                id: false,
            },
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get humans', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Get human by id
 * @param id    The uuid of the human
 * @returns     The human or undefined if not found
 */
export async function getHumanByUuid(id: string) {
    if (!isValidUUID(id)) {
        throw new ServiceError('Invalid uuid', {
            statusCode: 400,
            code: 'invalid_uuid',
            details: {
                id,
            },
        });
    }

    try {
        return await getDb().query.humans.findFirst({
            where: eq(humans.uuid, id),
            columns: {
                id: false,
            },
        });
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to get human', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Add a human
 * @param secret        The secret to authorize the operation
 * @param firstname     The first name of the human
 * @param lastname      The last name of the human
 * @param birthdate     The birthdate of the human
 * @returns             The added human
 */
export async function addHuman(
    secret: string,
    firstname: string,
    lastname: string,
    birthdate: string,
) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const birthdateParts = birthdate.split('-');
    if (
        birthdateParts.length !== 3 ||
        birthdateParts[0].length !== 4 ||
        birthdateParts[1].length !== 2 ||
        birthdateParts[2].length !== 2
    ) {
        throw new ServiceError('Invalid birthdate', {
            statusCode: 400,
            code: 'invalid_birthdate',
            details: {
                birthdate,
                format: 'YYYY-MM-DD',
            },
        });
    }

    const firstnameInput = firstname.trim();
    if (firstnameInput.length < 2 || firstnameInput.length > 100) {
        throw new ServiceError('Invalid firstname', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                firstname,
                description: 'First name must be between 2 and 100 characters',
            },
        });
    }

    const lastnameInput = lastname.trim();
    if (lastnameInput.length === 0) {
        throw new ServiceError('Invalid lastname', {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                lastname,
                description: 'Last name must be between 2 and 100 characters',
            },
        });
    }

    try {
        const [human] = await getDb()
            .insert(humans)
            .values({
                uuid: generateUUID(),
                firstname: firstnameInput,
                lastname: lastnameInput,
                birthdate,
            })
            .returning();
        return human;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to add human', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Update a human
 * @param secret        The secret to authorize the operation
 * @param id            The id of the human
 * @param firstname     The first name of the human
 * @param lastname      The last name of the human
 * @param birthdate     The birthdate of the human
 * @returns             The updated human
 */
export async function updateHuman(
    secret: string,
    id: number,
    firstname?: string,
    lastname?: string,
    birthdate?: string,
) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const existingHuman = await $getHumanById(id);
    if (!existingHuman) {
        throw new ServiceError('Human does not exist', {
            statusCode: 400,
            code: 'human_does_not_exist',
            details: {
                id,
            },
        });
    }

    const values: Partial<Human> = {};

    if (birthdate) {
        const birthdateParts = birthdate.split('-');

        if (
            birthdateParts.length !== 3 ||
            birthdateParts[0].length !== 4 ||
            birthdateParts[1].length !== 2 ||
            birthdateParts[2].length !== 2
        ) {
            throw new ServiceError('Invalid birthdate', {
                statusCode: 400,
                code: 'invalid_data',
                details: {
                    birthdate,
                    format: 'YYYY-MM-DD',
                },
            });
        }
        values.birthdate = birthdate;
    }

    if (firstname !== undefined) {
        const firstnameInput = firstname.trim();
        if (firstnameInput.length < 2 || firstnameInput.length > 100) {
            throw new ServiceError('Invalid firstname', {
                statusCode: 400,
                code: 'invalid_data',
                details: {
                    firstname,
                    description:
                        'First name must be between 2 and 100 characters',
                },
            });
        }
        values.firstname = firstnameInput;
    }

    if (lastname !== undefined) {
        const lastnameInput = lastname.trim();
        if (lastnameInput.length < 2 || lastnameInput.length > 100) {
            throw new ServiceError('Invalid lastname', {
                statusCode: 400,
                code: 'invalid_data',
                details: {
                    lastname,
                    description:
                        'Last name must be between 2 and 100 characters',
                },
            });
        }
        values.lastname = lastnameInput;
    }

    if (Object.keys(values).length === 0) {
        throw new ServiceError('No values to update', {
            statusCode: 400,
            code: 'no_values',
        });
    }

    try {
        const [human] = await getDb()
            .update(humans)
            .set(values)
            .where(eq(humans.id, id))
            .returning();

        return human;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to update human', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}

/**
 * Delete a human
 * @param secret    The secret to authorize the operation
 * @param id        The id of the human
 * @returns         The deleted human
 */
export async function deleteHuman(id: number, secret: string) {
    if (!checkEditSecret(secret)) {
        throw new ServiceError('Unauthorized', {
            statusCode: 401,
            code: 'unauthorized',
        });
    }

    const existingHuman = await $getHumanById(id);
    if (!existingHuman) {
        throw new ServiceError('Human does not exist', {
            statusCode: 400,
            code: 'human_does_not_exist',
            details: {
                id,
            },
        });
    }

    try {
        const [human] = await getDb()
            .delete(humans)
            .where(eq(humans.id, id))
            .returning();

        return human;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to delete human', {
            statusCode: 400,
            code: 'db_error',
        });
    }
}
