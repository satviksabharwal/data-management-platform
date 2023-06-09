import {UPLOAD_DATASET_REQUEST,UPLOAD_DATASET_SUCCESS,UPLOAD_DATASET_FAIL,
    DELETE_DATASET_REQUEST,DELETE_DATASET_SUCCESS,DELETE_DATASET_FAIL}  from './dataset.types';

const DATASET_INITIAL_STATE={
    uploadedDataset:null,
    uploadError:null,
    uploadLoading:false
}

 const DELETE_DATASET_INITIAL_STATE={
     deletedDataset:null,
     deletedDatasetError:null,
     deletedDatasetLoading:false
 }

export const datasetReducer=(state=DATASET_INITIAL_STATE,action)=>{
    switch(action.type){
        case UPLOAD_DATASET_REQUEST: return {...state, uploadLoading:true }
        case UPLOAD_DATASET_SUCCESS: return {...state,uploadLoading:false,uploadedDataset:action.payload}
        case UPLOAD_DATASET_FAIL: return {...state,uploadLoading:false,error:action.payload }                                          
        default: return state;
    }
}

 export const deleteDatasetReducer=(state=DELETE_DATASET_INITIAL_STATE,action)=>{
     switch(action.type){
         case DELETE_DATASET_REQUEST: return {...state, deletedDatasetLoading:true }
         case DELETE_DATASET_SUCCESS: return {...state,deletedDatasetLoading:false,deletedDataset:action.payload}
         case DELETE_DATASET_FAIL: return {...state,deletedDatasetLoading:false,error:action.payload }                                          
         default: return state;
     }
 }
