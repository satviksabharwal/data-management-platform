import { createUserIfNotExistsAndRetrieveMetadata } from "../actions/users";

export async function retrieveCurrentUserMetadata(currentUser, currentUserMetadata, setUserMetadata){
    if (currentUser.uid && currentUser.email) {
        const handleUserMetadata = async (userUid, email) => {
            const apiResponse = await createUserIfNotExistsAndRetrieveMetadata(userUid, email);
            const retrievedMetadata = apiResponse.response[0];
            const {
                user_email: userEmail,
                user_firebase_id: userFirebaseId,
                user_id: userId,
                user_role: userRole,
                user_storage_used: userStorageUsed,
                user_version: userVersion
            } = retrievedMetadata;
            const newValue = {
                userEmail,
                userFirebaseId,
                userId,
                userRole,
                userStorageUsed,
                userVersion
            };
            setUserMetadata(newValue);
        }
        handleUserMetadata(currentUser.uid, currentUser.email).then(() => null);
    }
}
