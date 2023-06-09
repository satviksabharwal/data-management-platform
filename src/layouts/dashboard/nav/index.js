import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack, Tooltip } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
// mock
import { useSelector } from 'react-redux';
import account from '../../../_mock/account';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import navConfig from './config';
import { selectCurrentUser } from '../../../store/user/user.selector';
import { CurrentUserMetadataContext } from '../../../App';
// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { currentUserMetadata } = useContext(CurrentUserMetadataContext);
  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');
  const handleUpgrade = () => {
    navigate('/dashboard/payment');
  };
  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <Box sx={{ mb: 5, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            <Avatar src={account.photoURL} alt="photoURL" />
            <Box sx={{ ml: 2 }}>
              <Tooltip title={currentUser && currentUser.email}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                  {currentUser && currentUser.displayName}
                </Typography>
              </Tooltip>
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      <NavSection data={navConfig} />

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
        <Stack alignItems="center" spacing={3} sx={{ pt: 5, borderRadius: 2, position: 'relative' }}>
          {currentUserMetadata.userVersion === 'free' ? (
            <>
              <Box
                component="img"
                src="/assets/illustrations/illustration_avatar.png"
                sx={{ width: 100, position: 'absolute', top: -50 }}
              />
              <Box sx={{ textAlign: 'center' }}>
                <Typography gutterBottom variant="h6">
                  Get more Storage?
                </Typography>
              </Box>

              <Button variant="contained" style={{ backgroundColor: '#48B2E3' }} onClick={handleUpgrade}>
                Upgrade to Premium!
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ textAlign: 'center' }}>
                <Typography gutterBottom style={{ color: 'green' }} variant="h6">
                  <WorkspacePremiumIcon /> Premium User <WorkspacePremiumIcon />
                </Typography>
                <Button variant="contained" style={{ backgroundColor: '#48B2E3' }}>
                  Manage your subscription
                </Button>
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
