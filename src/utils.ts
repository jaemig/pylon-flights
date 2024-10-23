import { getEnv, ServiceError } from '@getcronit/pylon';
import { randomUUID } from 'crypto';
/**
 * Check if the given string is a valid UUID
 * @param uuid  The string to check
 * @returns     True if the string is a valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
    return /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i.test(uuid);
}

/**
 * Generate a new UUID
 * @returns    A new UUID
 */
export function generateUUID(): string {
    //* We provide a custom generate function to make it easier when switching to a different UUID generation library
    return randomUUID();
}

/**
 * Check if the given secret is the edit secret
 * @param secret    The secret to check
 * @returns         True if the secret is the edit secret, false otherwise
 */
export function checkEditSecret(secret: string): boolean {
    return getEnv().SEED_SECRET === secret;
}

/**
 * Validate name
 * @param name      The name to validate (should be trimmed before calling this function)
 * @param field     The field name
 * @param minLength The minimum length of the name (default: 2)
 * @param maxLength The maximum length of the name (default: 100)
 * @throws          ServiceError if the name is invalid
 */
export function validateName(
    name: string,
    field: string,
    minLength = 2,
    maxLength = 100,
): void {
    if (name.length < minLength || name.length > maxLength) {
        throw new ServiceError(`Invalid ${field}`, {
            statusCode: 400,
            code: 'invalid_data',
            details: {
                [field]: name,
                description: `${field} must be between 2 and 100 characters`,
            },
        });
    }
}

/**
 * Count the number of decimals in a number
 * @param nr    The number to count the decimals of
 * @returns     The number of decimals
 */
export function countDecimals(nr: number): number {
    if (Math.floor(nr.valueOf()) === nr.valueOf()) return 0;

    var str = nr.toString();
    if (str.indexOf('.') !== -1 && str.indexOf('-') !== -1) {
        return str.split('-')[1].length || 0;
    } else if (str.indexOf('.') !== -1) {
        return str.split('.')[1].length || 0;
    }
    return str.split('-')[1].length || 0;
}

/**
 * Validate the pagination parameters
 * @param take  The number of items to take
 * @param skip  The number of items to skip
 * @throws      ServiceError if the pagination is invalid
 */
export function validatePagination(take?: number, skip?: number) {
    if (
        (take !== undefined && (take < 0 || take > 150)) ||
        (skip !== undefined && skip < 0)
    ) {
        throw new ServiceError('Invalid pagination', {
            statusCode: 400,
            code: 'invalid_pagination',
            details: {
                take,
                skip,
                maximumTake: 150,
            },
        });
    }
}
