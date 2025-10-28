import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CognitoUser, CognitoUserPool, AuthenticationDetails, CognitoUserSession, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import apiService from '../services/api';

interface AuthContextType {
  user: CognitoUser | null;
  session: CognitoUserSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => void;
  resendConfirmationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [session, setSession] = useState<CognitoUserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const userPool = new CognitoUserPool({
    UserPoolId: process.env.REACT_APP_USER_POOL_ID || '',
    ClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
  });

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err: any, session: CognitoUserSession) => {
        if (err) {
          console.error('Error getting session:', err);
          setLoading(false);
          return;
        }
        if (session) {
          setUser(currentUser);
          setSession(session);
          apiService.setSession(session);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session: CognitoUserSession) => {
          setUser(cognitoUser);
          setSession(session);
          apiService.setSession(session);
          resolve();
        },
        onFailure: (err: any) => {
          console.error('Sign in failed:', err);
          reject(err);
        },
        newPasswordRequired: (userAttributes: any, requiredAttributes: any) => {
          // Handle new password required
          reject(new Error('New password required'));
        },
      });
    });
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'given_name', Value: firstName }),
        new CognitoUserAttribute({ Name: 'family_name', Value: lastName }),
      ];

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          console.error('Sign up failed:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  };

  const confirmSignUp = async (email: string, code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          console.error('Confirmation failed:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  };

  const resendConfirmationCode = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          console.error('Resend confirmation failed:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve();
        },
        onFailure: (err: any) => {
          console.error('Forgot password failed:', err);
          reject(err);
        },
      });
    });
  };

  const confirmPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err: any) => {
          console.error('Confirm password failed:', err);
          reject(err);
        },
      });
    });
  };

  const signOut = () => {
    if (user) {
      user.signOut();
    }
    setUser(null);
    setSession(null);
    apiService.setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    resendConfirmationCode,
    forgotPassword,
    confirmPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
