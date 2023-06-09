import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// selector
import { useSelector } from 'react-redux';
// @mui
// import { useTheme } from '@mui/material/styles';
import { Box, Link } from '@mui/material';
import { selectCurrentUser } from '../../store/user/user.selector';

// ----------------------------------------------------------------------

const Logo = forwardRef(({ disabledLink = false, sx }) => {
  // const theme = useTheme();

  // const PRIMARY_LIGHT = theme.palette.primary.light;

  // const PRIMARY_MAIN = theme.palette.primary.main;

  // const PRIMARY_DARK = theme.palette.primary.dark;
  const currentUser = useSelector(selectCurrentUser);

  // OR using local (public folder)
  // -------------------------------------------------------
  const logo = (
    <Box component="img" src="/assets/logo.svg" sx={{ width: 100, height: 100, cursor: 'pointer', ...sx }} />
  );

  if (disabledLink) {
    return <>{logo}</>;
  }
  return (
    <Link
      to={`${currentUser?.displayName ? '/dashboard/app' : '/login'}`}
      component={RouterLink}
      sx={{ display: 'contents' }}
    >
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  sx: PropTypes.object,
  disabledLink: PropTypes.bool,
};

export default Logo;
