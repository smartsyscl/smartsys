
'use client'; // Can be used by client components

import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User,
  type AuthError,
} from 'firebase/auth';

export const signInUser = async (
  email: string, 
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    // We catch all errors, including multi-factor auth, and return them.
    // The login page will decide how to display them.
    return { user: null, error: error as AuthError };
  }
};

export const signOutUser = async (): Promise<{ success: boolean, error: AuthError | null }> => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
     return { success: false, error: error as AuthError };
  }
};

export const onAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Future function for enrollment (example structure)
// import { TotpSecret } from 'firebase/auth';
// export const startTotpEnrollment = async (user: User): Promise<{session: MultiFactorSession, secret: TotpSecret} | {error: AuthError}> => {
//   try {
//     const session = await user.multiFactor.getSession();
//     const secret = await TotpMultiFactorGenerator.generateSecret(session);
//     return { session, secret };
//   } catch (error) {
//     return { error: error as AuthError };
//   }
// };

// export const finalizeTotpEnrollment = async (user: User, verificationCode: string, session: MultiFactorSession, secretString: string): Promise<{success:boolean, error?: AuthError}> => {
//   try {
//     const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secretString, verificationCode);
//     await user.multiFactor.enroll(assertion, 'My TOTP Authenticator');
//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error as AuthError };
//   }
// };
