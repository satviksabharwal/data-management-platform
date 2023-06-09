export async function createUserIfNotExistsAndRetrieveMetadata(firebaseUserId, userEmail) {
    let res = {};
    if (!firebaseUserId || !userEmail) return null;
    await fetch('/create_user_if_not_exists_and_retrieve_metadata/',
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "firebaseUserId": firebaseUserId,
                "userEmail": userEmail
            })
        })
        .then(response => response.json())
        .then(result => {
            res = result;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    return res;
}

export async function retrieveUserMetadata(userId){
    let res = {};
    if (!userId) return null;
    await fetch(`/retrieve_user_metadata/${userId}`,
        {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(result => {
            res = result;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    return res;
}

export async function deleteUserMetadata(userId){
    let res = {};
    if (!userId) return null;
    await fetch(`/delete_user_metadata/${userId}`,
        {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(result => {
            res = result;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    return res;
}

export async function updateUserVersionPremium(userId) {
    let res = {};
    if (!userId) return null;
    await fetch(`/update_user_version_premium/${userId}`,
        {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(result => {
            res = result;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    return res;
}

export async function updateUserVersionFree(userId) {
    let res = {};
    if (!userId) return null;
    await fetch(`/update_user_version_free/${userId}`,
        {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(result => {
            res = result;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    return res;
}
