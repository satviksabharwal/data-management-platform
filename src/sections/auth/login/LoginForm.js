import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// components
import Iconify from '../../../components/iconify';
import { signInAuthWithEmailAndPassword } from '../../../utils/firebase/firebase.utils';
// ----------------------------------------------------------------------
const defaultFormFields = { email: '', password: '' };
export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { email, password } = formFields;

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await signInAuthWithEmailAndPassword(email, password);
      resetFormFields();
      if (response) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/wrong-password':
          toast.error('Incorrect password for email');
          break;
        case 'auth/user-not-found':
          toast.error('No user is authenticated with this email id');
          break;
        default:
          toast.error('Error while signing in: ', error);
      }
    }
  };

  const forgotPasswordHandler = () => {
    navigate('/forgotpassword');
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        <ToastContainer />
        <Stack spacing={3}>
          <TextField
            name="email"
            label="Email address"
            type={'email'}
            required
            id="email_textfield"
            variant="outlined"
            fullWidth
            onChange={handleChange}
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            id="password_textfield"
            variant="outlined"
            fullWidth
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ my: 2 }}>
          <Link
            variant="subtitle2"
            underline="hover"
            sx={{ ml: 19, marginLeft: `auto` }}
            onClick={forgotPasswordHandler}
            style={{ cursor: 'pointer' }}
          >
            Forgot password?
          </Link>
        </Stack>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" style={{ backgroundColor: '#48B2E3' }}>
          Login
        </LoadingButton>
      </form>
    </>
  );
}
