import { getEnv } from '@getcronit/pylon';
import { randomUUID } from 'crypto';
/**
 * Check if the given string is a valid UUID
 * @param uuid  The string to check
 * @returns     True if the string is a valid UUID, false otherwise
 */
export const isValidUUID = (uuid: string): boolean => {
    return /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i.test(uuid);
};

/**
 * Generate a new UUID
 * @returns    A new UUID
 */
export const generateUUID = (): string => {
    //* We provide a custom generate function to make it easier when switching to a different UUID generation library
    return randomUUID();
};

/**
 * Check if the given secret is the edit secret
 * @param secret    The secret to check
 * @returns         True if the secret is the edit secret, false otherwise
 */
export const checkEditSecret = (secret: string): boolean => {
    return getEnv().EDIT_SECRET === secret;
};

/**
 * Count the number of decimals in a number
 * @param nr    The number to count the decimals of
 * @returns     The number of decimals
 */
export const countDecimals = (nr: number): number => {
    if (Math.floor(nr.valueOf()) === nr.valueOf()) return 0;

    var str = nr.toString();
    if (str.indexOf('.') !== -1 && str.indexOf('-') !== -1) {
        return str.split('-')[1].length || 0;
    } else if (str.indexOf('.') !== -1) {
        return str.split('.')[1].length || 0;
    }
    return str.split('-')[1].length || 0;
};
