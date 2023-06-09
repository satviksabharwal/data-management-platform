import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// @mui
import { Card, Stack, Button, Container, Typography, Link, IconButton } from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';

import { ref, getBlob } from 'firebase/storage';
import { storage } from '../utils/firebase/firebase.utils';
import { getDatasetListAction } from '../store/datasetList/datasetList.action';

// components
import SearchBox from '../components/search-box';
import Iconify from '../components/iconify';
import ShareButton from '../components/button/ShareButton';
import DeleteButton from '../components/button/DeleteButton';
import TagButton from '../components/button/TagButton';

// sections
import { selectDatasetList } from '../store/datasetList/datasetList.selector';
import { CurrentUserMetadataContext } from '../App';
import { selectCurrentUser } from '../store/user/user.selector';
import { retrieveCurrentUserMetadata } from '../utils/utilFunctions';
import { updateFileMetadataAfterDownload } from '../actions/files';
import AccessControlChangeButton from '../components/button/AccessControlChangeButton';

export default function DataPage() {
  const [stateChangeFlag, setStateChangeFlag] = useState(0);
  const { currentUserMetadata, setUserMetadata, setOwnedFilesMetadata } = useContext(CurrentUserMetadataContext);
  const columns = [
    { field: 'id', headerName: 'Index', width: 90, hide: true },
    {
      field: 'name',
      headerName: 'Filename',
      width: 220,
      editable: false,
      renderCell: (params) => {
        const target = params?.row?.name;
        const targetArr = target.split('.');
        // remove last element (the filename's random uuid)
        targetArr.pop();
        const cleanedName = targetArr.join('.');
        return <> {cleanedName} </>;
      },
    },
    {
      field: 'status',
      headerName: 'Access Control Level',
      width: 250,
      editable: true,
      renderCell: (params) => {
        const fileStatus =
          params && params.row && params.row.customMetadata && params.row.customMetadata.is_file_public;
        const isOwnFile = currentUserMetadata.userId === params?.row?.customMetadata?.file_uploader;
        return (
          <>
            <AccessControlChangeButton
              fileStatus={fileStatus}
              fileName={params?.row?.name}
              fileId={encodeURIComponent(params?.row?.md5Hash) + params?.row?.name}
              isOwnFile={isOwnFile}
            />
          </>
        );
      },
    },
    {
      field: 'contentType',
      headerName: 'Content Type',
      type: 'string',
      width: 150,
      editable: false,
    },
    {
      field: 'tags',
      headerName: 'Associated Tags',
      width: 200,
      renderCell: (params) => {
        const tags = params?.row?.customMetadata?.tags;
        return <>{tags}</>;
      },
    },
    {
      field: 'size',
      headerName: 'Size',
      width: 100,
      editable: false,
      renderCell: (params) => {
        const target = params?.row?.size;
        let value = 0;
        if (target < 1024) {
          value = `${target} Bytes`;
        } else if (target >= 1024 && target < 1024 * 1024) {
          value = `${Number(target / 1024).toFixed(2)} KB`;
        } else if (target >= 1024 * 1024 && target < 1024 * 1024 * 1024) {
          value = `${Number(target / (1024 * 1024)).toFixed(2)} MB`;
        } else if (target >= 1024 * 1024 * 1024) {
          value = `${Number(target / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }
        return <> {value} </>;
      },
    },
    {
      field: 'timeCreated',
      headerName: 'Uploaded on',
      type: 'Date',
      width: 125,
      hide: true,
      renderCell: (params) => {
        const target = params && params.row && params.row.timeCreated;
        const dateOfUpload = target.split('T')[0];
        return <> {dateOfUpload} </>;
      },
    },
    {
      field: 'lastDownloadDate',
      headerName: 'Last Download Date (UTC)',
      sortable: true,
      hide: true,
      width: 200,
      renderCell: (params) => <>{params?.row?.customMetadata?.file_last_download_time.split('T')[0] ?? '-'}</>,
    },
    {
      field: 'downloadCount',
      headerName: 'Download Count',
      sortable: true,
      hide: true,
      width: 150,
      renderCell: (params) => {
        const isOwnFile = currentUserMetadata.userId === params?.row?.customMetadata?.file_uploader;
        return <> {isOwnFile ? params?.row?.customMetadata?.file_download_count : '-'} </>;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 250,
      renderCell: (params) => {
        const isOwnFile = currentUserMetadata.userId === params?.row?.customMetadata?.file_uploader;
        return (
          <>
            <IconButton
              onClick={async () => {
                const fileRef = ref(storage, params.row.fullPath);
                const fileBlob = await getBlob(fileRef, 1000000000);
                const link = document.createElement('a');
                link.style.visibility = 'hidden';
                if (link.download !== undefined) {
                  link.href = URL.createObjectURL(fileBlob);
                  const nameArr = params.row.name.split('.');
                  nameArr.pop();
                  link.download = nameArr.join('.');
                  document.body.appendChild(link);
                  link.click();
                  window.URL.revokeObjectURL(link.href);
                  document.body.removeChild(link);
                  await updateFileMetadataAfterDownload(encodeURIComponent(params.row.md5Hash) + params.row.name).then(
                    () => setStateChangeFlag(stateChangeFlag + 1)
                  );
                }
              }}
            >
              <DownloadIcon />
            </IconButton>
            {isOwnFile ? (
              <>
                <ShareButton row={params?.row} />
                <TagButton
                  row={params?.row}
                  stateChangeFlag={stateChangeFlag}
                  setStateChangeFlag={setStateChangeFlag}
                />
                <DeleteButton row={params?.row} />
              </>
            ) : null}
          </>
        );
      },
    },
  ];

  const [sortModel, setSortModel] = useState([
    {
      field: 'id',
      sort: 'asc',
    },
  ]);

  const currentUser = useSelector(selectCurrentUser);
  const datasetList = useSelector(selectDatasetList);

  const dispatch = useDispatch();
  const [searchField, setSearchField] = useState('');

  useEffect(() => {
    if (!currentUserMetadata.userId) {
      retrieveCurrentUserMetadata(currentUser, currentUserMetadata, setUserMetadata).then(() => null);
    }
  }, [currentUser, currentUserMetadata, setUserMetadata]);

  useEffect(() => {
    if (currentUserMetadata.userId) {
      const datasetListRef = ref(storage, 'files/');
      // dispatching an action for getting all the list of datasets with metadata
      dispatch(getDatasetListAction(datasetListRef, currentUserMetadata.userId, setOwnedFilesMetadata));
    }
  }, [dispatch, currentUserMetadata.userId, stateChangeFlag, setOwnedFilesMetadata]);

  useEffect(() => {
    // perform the side effect here
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    if (params && params.filename) {
      setSearchField(params.filename);
    }
  }, []);

  console.log('datasetList>>>', datasetList);

  const handleChange = (e) => setSearchField(e.target.value);

  const filteredList = datasetList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchField.toLowerCase()) ||
      item?.customMetadata?.tags.toLowerCase().includes(searchField.toLowerCase())
  );

  if (!currentUserMetadata) return <>loading content...</>;

  return (
    <>
      <Helmet>
        <title> DataSet | dmSuite </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Files
          </Typography>
          <Link variant="subtitle2" underline="none" component={RouterLink} to="/dashboard/upload">
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              style={{ backgroundColor: '#48B2E3' }}
            >
              New Upload
            </Button>
          </Link>
        </Stack>
        <SearchBox
          placeholder="Search files here, by name or associated tag(s)!"
          value={searchField}
          handleChange={handleChange}
        />
        <Card>
          <Box sx={{ height: '55vh', width: '100%' }}>
            <DataGrid
              sortModel={sortModel}
              onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
              rows={filteredList}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection={false}
              disableSelectionOnClick
              experimentalFeatures={{ newEditingApi: true }}
            />
          </Box>
        </Card>
      </Container>
    </>
  );
}
