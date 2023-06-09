export async function uploadFileMetadata(fileMetadataObject){
    let res = {};
    if(!fileMetadataObject) return null;
    await fetch('/upload_file_metadata',
        {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileMetadataObject)
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

export async function retrievePublicFilesMetadata(){
    let res = {};
    await fetch(`/retrieve_all_files_metadata`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
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

export async function retrieveOwnedFilesMetadata(userId) {
    let res = {};
    if (!userId) return null;
    await fetch(`/retrieve_owned_files_metadata/${userId}`,
        {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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

export async function retrieveSharedFilesMetadata(userId) {
    let res = {};
    if (!userId) return null;
    await fetch(`/retrieve_shared_files_metadata/${userId}`,
        {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
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

export async function deleteFileMetadata(fileId) {
    let res = {};
    if (!fileId) return null;
    await fetch(`/delete_file_metadata/${fileId}`,
        {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
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

export async function updateFileMetadataAfterDownload(fileId){
    let res = {};
    if (!fileId) return null;
    await fetch(`/update_file_metadata_after_download/${fileId}`,{
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
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

export async function retrieveFileTags(fileId){
    let res = {};
    if (!fileId) return null;
    await fetch(`/get_file_tags/${fileId}`,{
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
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

export async function updateFileTags(fileId, fileTags){
    let res = {};
    if (!fileId) return null;
    await fetch(`/update_file_tags/${fileId}`,{
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({fileTags})
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

export async function updateFileGeneralAccess(fileId, isFilePublic){
    let res = {};
    if (!fileId) return null;
    await fetch(`/update_file_general_access/${fileId}`,{
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFilePublic })
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

export async function retrieveFileSharedToEmails(fileId){
    let res = {};
    if (!fileId) return null;
    await fetch(`/retrieve_emails_file_shared_to/${fileId}`,{
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
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

export async function updateFileSharedToEmails(fileId, userEmail, emails){
    let res = {};
    if (!fileId) return null;
    await fetch(`/update_emails_file_shared_to/${fileId}`,{
        method: 'PUT',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({userEmail, emails})
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

export async function deleteFileSharedToEmail(fileId, email){
    let res = {};
    if (!fileId) return null;
    await fetch(`/delete_email_file_shared_to/${fileId}`,{
        method: 'DELETE',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
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
