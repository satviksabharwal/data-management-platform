import React, { useState, useEffect, useContext} from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
// @mui
import { Card, Stack, Container, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import {useDispatch,useSelector} from 'react-redux'
import { toast, ToastContainer } from 'react-toastify';
import {v4} from "uuid";
import 'react-toastify/dist/ReactToastify.css';
import { ref } from "firebase/storage";
import { storage } from "../utils/firebase/firebase.utils";
import Iconify from '../components/iconify';

import {uploadDatasetAction} from '../store/dataset/dataset.action'
import {CurrentUserMetadataContext} from "../App";
import {selectCurrentUser} from "../store/user/user.selector";
import {retrieveCurrentUserMetadata} from "../utils/utilFunctions";
import {retrieveUserMetadata} from "../actions/users";

// Style the Button component
const Button = styled.button`
  /* Insert your favorite CSS code to style a button */
  background: white;
  padding: 0.5rem;
  border-radius: 0.3rem;
  cursor: pointer;
  margin-top: 1rem;
  border: none;
`;
export default function UploadPage() {
  const currentUser = useSelector(selectCurrentUser);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { currentUserMetadata, setUserMetadata } = useContext(CurrentUserMetadataContext);

  useEffect(() => {
    if (!currentUserMetadata.userId) {
      if (window.localStorage.currentUserMetadata) {
        setUserMetadata(JSON.parse(window.localStorage.currentUserMetadata));
      } else {
        retrieveCurrentUserMetadata(currentUser, currentUserMetadata, setUserMetadata).then(() => null);
      }
    }
  }, [currentUser, currentUserMetadata, setUserMetadata]);

  // Create a reference to the hidden file input element
  const hiddenFileInput = React.useRef(null);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = (event) => {
    event.preventDefault();
    hiddenFileInput.current.click();
  };

  const handleChange = async (event) => {
    const datasetUploaded = event.target.files[0];
    if (datasetUploaded == null) return;
    const datasetRef = ref(storage, `files/${datasetUploaded.name}.${v4()}`);
    try{
      // dispatching an action for uploading dataset
      setIsLoading(true);
      await dispatch(uploadDatasetAction(datasetRef, datasetUploaded, currentUserMetadata));
      setIsLoading(false);
      toast.success('Dataset uploaded successfully');
      const res = await retrieveUserMetadata(currentUserMetadata.userId);
      setUserMetadata(res);
    } catch(err) {
      toast.error(err);
    }   
  };


  return (
    <>
      <Helmet>
        <title> Upload | dmSuite </title>
      </Helmet>

      <Container>
      <ToastContainer />
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Upload File
          </Typography>
        </Stack>
        <div style={{textAlign:'center'}}>
          { !isLoading ?
              <>
              <Card>
                <Button >
                  <Iconify icon="material-symbols:backup" onClick={handleClick} sx={{ color: "#48b2e3", width: 150, height: 150 }} />
                </Button>
                <input type="file" ref={hiddenFileInput} onChange={handleChange} style={{ display: 'none' }} />
              </Card>
              <Typography style={{ fontSize: 14, color:"GrayText", marginTop: 10}}>
                Click on the icon to upload your file!
              </Typography>
              </> :
              <CircularProgress />
          }
        </div>
      </Container>
    </>
  );
}
