import {GET_DATASETLIST_REQUEST,GET_DATASETLIST_SUCCESS,GET_DATASETLIST_FAIL}  from './datasetList.types';

const DATASETLIST_INITIAL_STATE={
    datasetList:[],
    error:null,
    loading:false
}

export const datasetListReducer=(state=DATASETLIST_INITIAL_STATE,action)=>{
    switch(action.type){
        case GET_DATASETLIST_REQUEST: return {
                                              ...state, 
                                              loading:true 
                                             }
        case GET_DATASETLIST_SUCCESS: return {
                                              ...state,
                                              loading:false,
                                              datasetList: action.payload
                                            }
        case GET_DATASETLIST_FAIL: return {...state,
                                            loading:false,
                                            error:action.payload
                                          }                                          
        default: return state;
    }
}