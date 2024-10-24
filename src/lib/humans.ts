import { and, eq, like, SQL } from 'drizzle-orm';
import { ServiceError } from '@getcronit/pylon';

import getDb from '../db';
import { Human, humans } from '../db/schema';
import {
    generateUUID,
    isValidUUID,
    validateName,
    validatePagination,
} from '../utils';
import { DEFAULT_TAKE } from '../constants';

/**
 * Validate birthdate
 * @param birthdate The birthdate to validate
 * @throws          ServiceError if the birthdate is invalid
 */
function validateBirthdate(birthdate: string): void {
    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdateRegex.test(birthdate)) {
        throw new ServiceError('Invalid birthdate format', {
            statusCode: 400,
            code: 'invalid_birthdate',
            details: {
                birthdate,
                format: 'YYYY-MM-DD',
                description: 'The birthdate must be in the format YYYY-MM-DD',
            },
        });
    }

    const date = new Date(birthdate);
    if (isNaN(date.getTime())) {
        throw new ServiceError('Invalid birthdate', {
            statusCode: 400,
            code: 'invalid_birthdate',
            details: {
                birthdate,
                description: 'The provided date is not valid',
            },
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
    validatePagination(take, skip);

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
            limit: take ?? DEFAULT_TAKE,
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
 * @param id    The id of the human
 * @returns     The human or undefined if not found
 */
export async function getHumanById(id: string) {
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
            where: eq(humans.id, id),
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
 * @param firstname     The first name of the human
 * @param lastname      The last name of the human
 * @param birthdate     The birthdate of the human
 * @returns             The added human
 */
export async function addHuman(
    firstname: string,
    lastname: string,
    birthdate: string,
) {
    firstname = firstname.trim();
    lastname = lastname.trim();

    validateBirthdate(birthdate);
    validateName(firstname, 'firstname');
    validateName(lastname, 'lastname');

    try {
        const [human] = await getDb()
            .insert(humans)
            .values({
                id: generateUUID(),
                firstname: firstname,
                lastname: lastname,
                birthdate,
            })
            .returning();
        return human;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to add human', {
            statusCode: 500,
            code: 'db_error',
        });
    }
}

/**
 * Update a human
 * @param id            The id of the human
 * @param firstname     The first name of the human
 * @param lastname      The last name of the human
 * @param birthdate     The birthdate of the human
 * @returns             The updated human
 */
export async function updateHuman(
    id: string,
    firstname?: string,
    lastname?: string,
    birthdate?: string,
) {
    const existingHuman = await getHumanById(id);
    if (!existingHuman) {
        throw new ServiceError('Human does not exist', {
            statusCode: 404,
            code: 'human_not_found',
            details: { id },
        });
    }

    const values: Partial<Human> = {};

    if (birthdate !== undefined) {
        validateBirthdate(birthdate);
        values.birthdate = birthdate;
    }

    if (firstname !== undefined) {
        firstname = firstname.trim();
        validateName(firstname, 'firstname');
        values.firstname = firstname;
    }

    if (lastname !== undefined) {
        lastname = lastname.trim();
        validateName(lastname, 'lastname');
        values.lastname = lastname;
    }

    if (Object.keys(values).length === 0) {
        throw new ServiceError('No values to update', {
            statusCode: 400,
            code: 'no_update_data',
        });
    }

    try {
        const [updatedHuman] = await getDb()
            .update(humans)
            .set(values)
            .where(eq(humans.id, id))
            .returning();

        return updatedHuman;
    } catch (e) {
        console.error(e);
        throw new ServiceError('Failed to update human', {
            statusCode: 500,
            code: 'db_error',
        });
    }
}

/**
 * Delete a human
 * @param id        The id of the human
 * @returns         The deleted human
 */
export async function deleteHuman(id: string) {
    const existingHuman = await getHumanById(id);
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
