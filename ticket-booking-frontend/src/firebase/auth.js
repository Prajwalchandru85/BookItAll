import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Register user
export const registerUser = async (name, email, password, phone = '') => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: name
    });

    // Send email verification
    await sendEmailVerification(user);

    // Save additional user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
      isVerified: false,
      role: 'user'
    });

    return {
      success: true,
      user: {
        id: user.uid,
        name,
        email,
        phone,
        isVerified: user.emailVerified
      },
      message: 'Registration successful! Please check your email for verification.'
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: getErrorMessage(error.code)
    };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    return {
      success: true,
      user: {
        id: user.uid,
        name: user.displayName || userData?.name,
        email: user.email,
        phone: userData?.phone || '',
        isVerified: user.emailVerified,
        role: userData?.role || 'user'
      },
      message: 'Login successful!'
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: getErrorMessage(error.code)
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Error logging out'
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};
