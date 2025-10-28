import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sign In form
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign Up form
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  // Confirmation form
  const [confirmationData, setConfirmationData] = useState({
    email: '',
    code: '',
  });

  // Forgot Password form
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
  });

  // Reset Password form
  const [resetPasswordData, setResetPasswordData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { signIn, signUp, confirmSignUp, resendConfirmationCode, forgotPassword, confirmPassword } = useAuth();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(signInData.email, signInData.password);
      setSuccess('Successfully signed in!');
      
      // Navigate to dashboard or intended destination
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await signUp(signUpData.email, signUpData.password, signUpData.firstName, signUpData.lastName);
      setSuccess('Account created! Please check your email for confirmation code.');
      setConfirmationData({ ...confirmationData, email: signUpData.email });
      setTabValue(2); // Switch to confirmation tab
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await confirmSignUp(confirmationData.email, confirmationData.code);
      setSuccess('Account confirmed! You can now sign in.');
      setTabValue(0); // Switch to sign in tab
    } catch (err: any) {
      setError(err.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      await resendConfirmationCode(confirmationData.email);
      setSuccess('Confirmation code resent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await forgotPassword(forgotPasswordData.email);
      setSuccess('Password reset code sent! Check your email.');
      setResetPasswordData({ ...resetPasswordData, email: forgotPasswordData.email });
      setTabValue(4); // Switch to reset password tab
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await confirmPassword(resetPasswordData.email, resetPasswordData.code, resetPasswordData.newPassword);
      setSuccess('Password reset successfully! You can now sign in.');
      setTabValue(0); // Switch to sign in tab
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            CDK SaaS Dashboard
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            Sign in to your account
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="auth tabs">
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
              <Tab label="Confirm" />
              <Tab label="Forgot Password" />
              <Tab label="Reset Password" />
            </Tabs>
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleSignIn}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={signInData.email}
                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
              <Link
                component="button"
                type="button"
                onClick={() => setTabValue(3)}
                sx={{ textAlign: 'center', display: 'block', width: '100%' }}
              >
                Forgot password?
              </Link>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSignUp}>
              <TextField
                fullWidth
                label="First Name"
                value={signUpData.firstName}
                onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={signUpData.lastName}
                onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={signUpData.confirmPassword}
                onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <form onSubmit={handleConfirmSignUp}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={confirmationData.email}
                onChange={(e) => setConfirmationData({ ...confirmationData, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Confirmation Code"
                value={confirmationData.code}
                onChange={(e) => setConfirmationData({ ...confirmationData, code: e.target.value })}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Confirm Account'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <form onSubmit={handleForgotPassword}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={forgotPasswordData.email}
                onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Code'}
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <form onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={resetPasswordData.email}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Reset Code"
                value={resetPasswordData.code}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, code: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={resetPasswordData.newPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </form>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthPage;
