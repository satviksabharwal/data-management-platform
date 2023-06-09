import {
    ref,
    list,
    getMetadata
  } from "firebase/storage";
import { storage } from "../../utils/firebase/firebase.utils";
import { GET_DATASETLIST_REQUEST,GET_DATASETLIST_SUCCESS,GET_DATASETLIST_FAIL } from './datasetList.types';
import {
    retrieveFileTags,
    retrieveOwnedFilesMetadata,
    retrievePublicFilesMetadata,
    retrieveSharedFilesMetadata
} from "../../actions/files";

export const getDatasetListAction = (datasetListRef, currentUserId, setOwnedFilesMetadata) => async (dispatch) => {
    dispatch({ type:GET_DATASETLIST_REQUEST });
    try {
        const response = await list(datasetListRef,  { maxResults: 100 });
        const responseList = [];
        const ownedFilesMetadata = (await retrieveOwnedFilesMetadata(currentUserId)).response;
        const publicFilesMetadata = (await retrievePublicFilesMetadata()).response;
        const sharedFilesMetadata = (await retrieveSharedFilesMetadata(currentUserId)).response;
        console.log(publicFilesMetadata);
        console.log(sharedFilesMetadata);
        setOwnedFilesMetadata(ownedFilesMetadata);

        const ownedFilesId = [];
        const publicFilesId = [];
        const accessibleFilesId = [];
        ownedFilesMetadata.forEach(ele => ownedFilesId.push(ele.file_id));
        publicFilesMetadata.forEach(ele => {
           if (ele.file_uploader !== currentUserId) {
               publicFilesId.push(ele.file_id);
           }
        });
        sharedFilesMetadata.forEach(ele => {
           if (!publicFilesId.includes(ele.file_id))
               accessibleFilesId.push(ele.file_id);
        });

        const ans = response.items.map(async (item,index) => {
              const location = item && item._location;
              const path = location && location.path_;
              const datasetRef = ref(storage, `${ path }`);
              const metadata = await getMetadata(datasetRef);
              const fileId = metadata.md5Hash + metadata.name;
              metadata.id = index + 1;
              if (ownedFilesId.includes(fileId)) {
                  metadata.customMetadata = ownedFilesMetadata.
                  find(ele => ele.file_id === fileId);
                  const t = await retrieveFileTags(encodeURIComponent(fileId));
                  metadata.customMetadata.tags = t?.response.map(r => r.file_tag).join(', ') ?? '';
                  responseList.push(metadata);
              } else if (publicFilesId.includes(fileId)) {
                  metadata.customMetadata = publicFilesMetadata.
                  find(ele => ele.file_id === fileId);
                  const t = await retrieveFileTags(encodeURIComponent(fileId));
                  metadata.customMetadata.tags = t?.response.map(r => r.file_tag).join(', ') ?? '';
                  responseList.push(metadata);
              } else if (accessibleFilesId.includes(fileId)) {
                  metadata.customMetadata = sharedFilesMetadata.
                  find(ele => ele.file_id === fileId);
                  const t = await retrieveFileTags(encodeURIComponent(fileId));
                  metadata.customMetadata.tags = t?.response.map(r => r.file_tag).join(', ') ?? '';
                  responseList.push(metadata);
              }
              return responseList;
        });

        await Promise.all(ans);
        dispatch( {type:GET_DATASETLIST_SUCCESS, payload: responseList });
    } catch(error) {
        console.log('Error while fetching dataset list:::::', error.message);
        dispatch( { type:GET_DATASETLIST_FAIL,payload: error.message})
    }

}