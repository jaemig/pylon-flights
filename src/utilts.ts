import { getEnv } from '@getcronit/pylon';
import { randomUUID } from 'crypto';
/**
 * Check if the given string is a valid UUID
 * @param uuid  The string to check
 * @returns     True if the string is a valid UUID, false otherwise
 */
export const isValidUUID = (uuid: string) => {
    return /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i.test(uuid);
}

/**
 * Generate a new UUID
 * @returns    A new UUID
 */
export const generateUUID = () => {
    //* We provide a custom generate function to make it easier when switching to a different UUID generation library
    return randomUUID();
}

/**
 * Check if the given secret is the edit secret
 * @param secret    The secret to check
 * @returns         True if the secret is the edit secret, false otherwise
 */
export const checkEditSecret = (secret: string) => {
    return getEnv().EDIT_SECRET === secret;
}
