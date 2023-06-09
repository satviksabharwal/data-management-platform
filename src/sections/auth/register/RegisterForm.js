import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// components
import Iconify from '../../../components/iconify';
import { createAuthUserWithEmailAndPassword, createUserDocumentFromAuth } from '../../../utils/firebase/firebase.utils';

const defaultFormFields = { displayName: '', email: '', password: '', confirmPassword: '' };

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formFields, setFormFields] = useState(defaultFormFields);
  const { displayName, email, password, confirmPassword } = formFields;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const resetFormFields = () => {
    setFormFields(defaultFormFields);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Password do not match');
    } else {
      try {
        const { user } = await createAuthUserWithEmailAndPassword(email, password);
        await createUserDocumentFromAuth(user, { displayName });
        resetFormFields();
        toast.success('Registered successfully!');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          toast.error('Can not create User, Email already in use');
        } else {
          toast.error(`User Creation Error: ${error?.message}`);
        }
      }
    }
  };

  return (
    <>
      <form onSubmit={handleRegister}>
        <ToastContainer />

        <Stack spacing={3}>
          <TextField
            name="displayName"
            label="Display Name"
            type={'text'}
            required
            id="outlined-basic"
            variant="outlined"
            fullWidth
            onChange={handleChange}
          />

          <TextField
            name="email"
            label="Email address"
            type={'email'}
            required
            id="outlined-basic"
            variant="outlined"
            fullWidth
            onChange={handleChange}
          />

          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            id="outlined-basic"
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

          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type={'password'}
            required
            id="outlined-basic"
            variant="outlined"
            fullWidth
            onChange={handleChange}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ my: 2 }}>
          <Checkbox
            name="remember"
            label="Remember me"
            sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
            id="outlined-basic"
            variant="outlined"
            fullWidth
            required
          />
          <Typography style={{ fontSize: 14, color: 'GrayText' }}>
            I hereby confirm that I have read, understood and agreed the{' '}
            <Link variant="subtitle2" target="_blank" href="/tac">
              data privacy statement.*
            </Link>
          </Typography>
        </Stack>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" style={{ backgroundColor: '#48B2E3' }}>
          Register
        </LoadingButton>
      </form>
    </>
  );
}
