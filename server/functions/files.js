// const crypto = require("crypto");
const nodemailer = require("nodemailer");

const uploadFileMetadata = async (pool, fileMetadataObject) => {
    try {
        const { fileId, userId, fileName, fileSize, fileType, fileUploadTime } = fileMetadataObject;
        const decodedFileId = decodeURIComponent(fileId);
        // const hash = crypto.createHash('sha256');
        // const fileId = hash.update(fileUrl).digest('hex');
        // const sharedToSize = sharedTo.length;

        // modify the user_storage_used of users
        return await pool.raw(`
            INSERT INTO files
            ("file_id", "file_name", "file_size", "file_type", "file_uploader", "is_file_public", "file_upload_time") VALUES
            ('${decodedFileId}', '${fileName}', '${fileSize}', '${fileType}', '${userId}', false, '${fileUploadTime}');
            UPDATE users SET user_storage_used = user_storage_used + ${fileSize} WHERE user_id = '${userId}';
        `);

    } catch (error) {
        console.error(error);
        throw error;
    }
}

const retrieveAllFilesMetadata = async pool => {
    try {
        return await pool.select('*').from('files').where({
            is_file_public: true ,
            is_file_blocked: false
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const retrieveOwnedFilesMetadata = async (pool, userId) => {
    try {
        return await pool.select('*').from('files').where({
            file_uploader: userId,
            is_file_blocked: false
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const retrieveSharedFilesMetadata = async (pool, userId) => {
    try {
        return await pool.raw(`SELECT *
            FROM files JOIN file_shared_to ON files.file_id = file_shared_to.file_id
            WHERE file_shared_to.user_email IN (SELECT user_email FROM users WHERE user_id = '${userId}')`);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updateFileMetadataAfterDownload = async (pool, fileId) => {
    try {
        const lastDownloadTime = new Date().toISOString();
        await pool.raw(
            `
                UPDATE files SET file_last_download_time = '${lastDownloadTime}', 
                file_download_count = files.file_download_count + 1 WHERE files.file_id = '${fileId}'; 
            `
        );
    } catch (error) {
        console.error(error);
        throw error;
    }
}
// Delete file Metadata
const deleteFileMetadata = async (pool, fileId) => {
    try {
        // to satisfy integrity check, the deletion for the table files has to be done last.
        await pool.raw(
            `
                UPDATE users SET user_storage_used = user_storage_used - 
                (SELECT file_size FROM files WHERE files.file_id = '${fileId}') 
                WHERE user_id = (SELECT file_uploader FROM files WHERE files.file_id = '${fileId}');
                DELETE FROM file_tags WHERE file_tags.file_id = '${fileId}';
                DELETE FROM file_shared_to WHERE file_shared_to.file_id = '${fileId}';
                DELETE FROM requests WHERE requests.file_id = '${fileId}';
                DELETE FROM files WHERE files.file_id = '${fileId}'; 
            `
        );
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const retrieveFileTags = async (pool, fileId) => {
    try {
        return await pool.raw(`SELECT file_tag FROM file_tags WHERE file_tags.file_id = '${fileId}';`);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateFileTags = async (pool, fileId, fileTags) => {
    try {
        // to avoid conflict, first delete all tags of the file, and add the new tag values
        await pool.raw(`DELETE FROM file_tags WHERE file_tags.file_id = '${fileId}';`);
        await pool("file_tags").insert(fileTags);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateFileGeneralAccessLevel = async (pool, fileId, isFilePublic) => {
    try {
        await pool.raw(`UPDATE files SET is_file_public = ${isFilePublic} WHERE file_id = '${fileId}'`);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const retrieveFileSharedToEmails = async (pool, fileId) => {
    try {
        return await pool.raw(`SELECT user_email FROM file_shared_to WHERE file_id = '${fileId}'`);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateFileSharedToEmails = async (pool, fileId, emails) => {
    try {
        await pool("file_shared_to").insert(emails);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const deleteFileSharedToEmail = async (pool, fileId, email) => {
    try {
        await pool.raw(`DELETE FROM file_shared_to WHERE file_shared_to.file_id = '${fileId}' AND 
                                 file_shared_to.user_email = '${email}'`);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const sendEmails = async (userEmail, emails, fileId) => {
    const targetArr = fileId.split('.');
    targetArr.pop();
    const cleanedName = targetArr.join('.');
    const index2 = cleanedName.indexOf("==") + 2;
    const result = cleanedName.substring(index2);
    const params = new URLSearchParams();
    params.set("filename", result);
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "dmsuite101@gmail.com",
            pass: "artxfnxsycjcrjjn"
        }
    });

    const mailOptions = {
        from: 'dmsuite101@gmail.com', // sender address
        to: emails, // List of receivers
        subject: `${userEmail} has shared a file with you!`, // subject line
        text: `You can find the file here: http://localhost:3000/dashboard/dataset?${params.toString()}`, // TODO: replace with actual HOST name
    };

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}

module.exports = {
    uploadFileMetadata,
    retrieveAllFilesMetadata,
    retrieveOwnedFilesMetadata,
    retrieveSharedFilesMetadata,
    updateFileMetadataAfterDownload,
    deleteFileMetadata,
    retrieveFileTags,
    updateFileTags,
    updateFileGeneralAccessLevel,
    retrieveFileSharedToEmails,
    updateFileSharedToEmails,
    deleteFileSharedToEmail,
    sendEmails
};
