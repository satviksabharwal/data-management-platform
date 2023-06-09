const crypto = require('crypto');

const retrieveUserMetadata = async (pool, userId) => {
    // get  user meta data
    try {
        return await pool.select('*').from('users').where({user_id: userId});
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const retrieveAllUsersMetadata = async pool => {
    // get all users meta data
    try {
        return await pool.select('*').from('users');
    } catch (error) {
        console.error(error);
        throw error;
    }
};
// create user
const createUserIfNotExistsAndRetrieveMetadata = async (pool, firebaseUserId, userEmail) => {
    try {
        await pool.raw(
            `
                INSERT INTO users ("user_id", "user_firebase_id", "user_email")
                SELECT '${crypto.randomUUID()}', '${firebaseUserId}', '${userEmail}'
                WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_email = '${userEmail}');
                
            `
        );
        return await pool.select('*').from('users').where({user_firebase_id: firebaseUserId});
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const deleteUserMetadata = async (pool, userId) => {
    // note: when user deletes their account, all files owned by them are also deleted!
    // to satisfy integrity constraint, the order of the deletion is important, don't shift them.
    try {
        await pool.raw(
            `
                DELETE FROM requests WHERE file_id IN
                    (SELECT file_id FROM files WHERE files.file_uploader = '${userId}');
                DELETE FROM file_tags WHERE file_tags.file_id IN 
                    (SELECT file_id FROM files WHERE files.file_uploader = '${userId}');
                DELETE FROM file_shared_to WHERE file_shared_to.user_email IN 
                    (SELECT user_email FROM users WHERE users.user_id = '${userId}'); 
                DELETE FROM files WHERE files.file_uploader = '${userId}';
                DELETE FROM users WHERE users.user_id = '${userId}';
            `
        )
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateUserVersionToPremium = async (pool, userId) => {
    // to upgrade a user to premium version
    try {
        const r = await pool.raw(
            `
                UPDATE users SET user_version = 'premium' WHERE user_id = '${userId}';
            `
        );
        console.log(r);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateUserVersionToFree = async (pool, userId) => {
    // to upgrade a user to free version
    try {
        await pool.raw(
            `
                UPDATE users SET user_version = 'free' WHERE user_id = '${userId}';
            `
        )
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = {
    retrieveUserMetadata,
    retrieveAllUsersMetadata,
    createUserIfNotExistsAndRetrieveMetadata,
    deleteUserMetadata,
    updateUserVersionToPremium,
    updateUserVersionToFree
};
