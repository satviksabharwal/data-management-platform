import { useEffect, useState, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
import { ref } from 'firebase/storage';
// sections
import { Statistics, FileOwnedStatistics } from '../sections/@dashboard/app';
// selector
import { selectCurrentUser } from '../store/user/user.selector';
import { CurrentUserMetadataContext } from '../App';
import { retrieveCurrentUserMetadata } from '../utils/utilFunctions';
import { storage } from '../utils/firebase/firebase.utils';
import { getDatasetListAction } from '../store/datasetList/datasetList.action';

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { currentUserMetadata, setUserMetadata, ownedFilesMetadata, setOwnedFilesMetadata } =
    useContext(CurrentUserMetadataContext);
  const theme = useTheme();
  const dispatch = useDispatch();
  const [ownedFilesStats, setOwnedFilesStats] = useState([]);
  useEffect(() => {
    retrieveCurrentUserMetadata(currentUser, currentUserMetadata, setUserMetadata).then(() => null);
    if (currentUserMetadata.userId) {
      const datasetListRef = ref(storage, 'files/');
      dispatch(getDatasetListAction(datasetListRef, currentUserMetadata.userId, setOwnedFilesMetadata));
    }
  }, [currentUser]);

  useEffect(() => {
    const obj = {};
    ownedFilesMetadata.forEach((ele) => {
      if (ele.file_type in obj) {
        obj[ele.file_type] = {
          fileType: ele.file_type,
          fileCount: obj[ele.file_type].fileCount + 1,
          totalStorage: obj[ele.file_type].totalStorage + ele.file_size,
          totalDownloadCount: obj[ele.file_type].totalDownloadCount + ele.file_download_count,
        };
      } else {
        obj[ele.file_type] = {
          fileType: ele.file_type,
          fileCount: 1,
          totalStorage: ele.file_size,
          totalDownloadCount: ele.file_download_count,
        };
      }
    });
    setOwnedFilesStats(Object.values(obj));
  }, [ownedFilesMetadata]);

  useEffect(() => {
    if (currentUser.displayName === undefined) {
      navigate('/login');
    }
  }, [currentUser.displayName]);

  return (
    <>
      <Helmet>
        <title> Dashboard | dmSuite </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back, {currentUser && currentUser.displayName}!
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={10} md={8} lg={8}>
            <FileOwnedStatistics
              title="Owned Files Stats"
              chartLabels={ownedFilesStats.map((ele) => ele.fileType.split('/')[1])}
              chartData={[
                {
                  name: 'File count',
                  type: 'column',
                  fill: 'solid',
                  data: ownedFilesStats.map((ele) => ele.fileCount),
                },
                {
                  name: 'Storage used (Megabytes)',
                  type: 'area',
                  fill: 'gradient',
                  data: ownedFilesStats.map((ele) => (ele.totalStorage / 1000000).toFixed(2)),
                },
                {
                  name: 'Total Downloads',
                  type: 'area',
                  fill: 'gradient',
                  data: ownedFilesStats.map((ele) => ele.totalDownloadCount),
                  color: 'green',
                },
              ]}
            />
          </Grid>
          {/* <Grid item xs={12} md={6} lg={8}>
            <AppTasks
              title="Tasks"
              list={[
                { id: '1', label: 'Create FireStone Logo' },
                { id: '2', label: 'Add SCSS and JS files if required' },
                { id: '3', label: 'Stakeholder Meeting' },
                { id: '4', label: 'Scoping & Estimations' },
                { id: '5', label: 'Sprint Showcase' },
              ]}
            />
          </Grid> */}
          <Grid item xs={12} md={6} lg={4}>
            {currentUserMetadata.userVersion === 'premium' ? (
              <Statistics
                title="Storage Stats (Max. 100GB)"
                chartData={[
                  { label: 'Storage Used', value: currentUserMetadata?.userStorageUsed / 1000000 },
                  { label: 'Storage Left', value: (100000000000 - currentUserMetadata?.userStorageUsed) / 1000000 },
                ]}
                chartColors={[theme.palette.error.main, theme.palette.primary.main]}
              />
            ) : (
              <Statistics
                title="Storage Stats (Max. 2GB)"
                chartData={[
                  { label: 'Storage Used', value: currentUserMetadata?.userStorageUsed / 1000000 },
                  { label: 'Storage Left', value: (2000000000 - currentUserMetadata?.userStorageUsed) / 1000000 },
                ]}
                chartColors={[theme.palette.error.main, theme.palette.primary.main]}
              />
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
