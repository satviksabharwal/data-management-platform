import { uploadBytes } from "firebase/storage";
import { toast } from "react-toastify";
import { UPLOAD_DATASET_REQUEST,UPLOAD_DATASET_SUCCESS,UPLOAD_DATASET_FAIL,DELETE_DATASET_REQUEST,DELETE_DATASET_SUCCESS,DELETE_DATASET_FAIL } from "./dataset.types";
import { uploadFileMetadata } from "../../actions/files";

export const uploadDatasetAction = (datasetRef, datasetUploaded, currentUserMetadata) => async(dispatch) => {
    dispatch({type:UPLOAD_DATASET_REQUEST});
    try {
       // in case it is above the allocated storage (1GB)
       if (datasetUploaded.size + currentUserMetadata.userStorageUsed > 2000000000) {
           toast.error('You do not have enough storage to upload this file...');
           return;
       }
       const snapshot = await uploadBytes(datasetRef, datasetUploaded);
       const metadata = snapshot && snapshot.metadata;
       // const url = await getDownloadURL(snapshot.ref);
       // const data = { url, metadata };
       const fileMetadataObject = {
           fileId: encodeURIComponent(metadata.md5Hash) + metadata.name,
           userId: currentUserMetadata.userId,
           fileName: metadata.name,
           fileSize: metadata.size,
           fileType: metadata.contentType,
           fileUploadTime: metadata.timeCreated
       };
       await uploadFileMetadata(fileMetadataObject);
       dispatch({type:UPLOAD_DATASET_SUCCESS,payload:'Dataset uploaded successfully'});
    } catch(error) {
        console.log('Error in uploading file:::::', error.message);
        dispatch({type:UPLOAD_DATASET_FAIL,payload:error.message});
    }

}

export const deleteDatasetAction = (datasetRef, deleteObject) => async(dispatch) => {
    dispatch({type:DELETE_DATASET_REQUEST});  
    try{
    const resp = await deleteObject(datasetRef);
    console.log('delete resp from action file>>>>>',resp);
    dispatch({type:DELETE_DATASET_SUCCESS,payload:'Dataset deleted successfully'});
    } catch(error) {
        dispatch({type:DELETE_DATASET_FAIL,payload:error.message});
    }
}