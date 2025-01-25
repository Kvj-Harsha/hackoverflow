import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, setDoc, collection, addDoc, getDoc, query, where, getDocs, updateDoc, limit, startAfter 
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, setCustomUserClaims } from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper: Generate a 5-digit random Institute ID
const generateInstituteId = () => Math.floor(10000 + Math.random() * 90000);

// Helper: Validate inputs
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test(phone);

// Helper: Fetch paginated results
export const fetchPaginatedResults = async (collectionName, filters = [], pageSize = 10, lastDocRef = null) => {
  let q = collection(db, collectionName);
  filters.forEach(([field, operator, value]) => {
    q = query(q, where(field, operator, value));
  });
  if (lastDocRef) {
    q = query(q, startAfter(lastDocRef), limit(pageSize));
  } else {
    q = query(q, limit(pageSize));
  }
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return { results, lastVisible: snapshot.docs[snapshot.docs.length - 1] };
};

// Admin Schema: Add a new admin with role-based claims
export const addAdmin = async (adminData) => {
  if (!validateEmail(adminData.email) || !validatePhoneNumber(adminData.phone)) {
    throw new Error("Invalid email or phone number format.");
  }
  const instituteId = generateInstituteId();
  const admin = { ...adminData, instituteId, role: "Admin" };

  // Create user with Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, admin.email, "defaultPassword123");
  const user = userCredential.user;

  // Assign custom claims for role
  await setCustomUserClaims(user.uid, { role: "Admin" });

  // Save admin to Firestore
  await setDoc(doc(db, "admins", admin.email), admin);
  return instituteId;
};

// Student Schema: Add a new student
export const addStudent = async (studentData) => {
  if (!validateEmail(studentData.email) || !validatePhoneNumber(studentData.phone)) {
    throw new Error("Invalid email or phone number format.");
  }
  const q = query(collection(db, "admins"), where("collegeName", "==", studentData.collegeName));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error("College not found");
  }
  const adminDoc = querySnapshot.docs[0];
  const instituteId = adminDoc.data().instituteId;
  const student = { ...studentData, instituteId, role: "Student", verified: false };

  await setDoc(doc(db, "students", student.email), student);
  await addDoc(collection(db, "adminRequests", adminDoc.id), {
    type: "StudentVerification",
    studentEmail: student.email
  });
};

// Recruiter Schema: Add a new recruiter
export const addRecruiter = async (recruiterData) => {
  if (!validateEmail(recruiterData.email)) {
    throw new Error("Invalid email format.");
  }
  const recruiter = { ...recruiterData, role: "Recruiter", approved: false };

  // Create user with Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, recruiter.email, "defaultPassword123");
  const user = userCredential.user;

  // Assign custom claims for role
  await setCustomUserClaims(user.uid, { role: "Recruiter" });

  // Save recruiter to Firestore
  await setDoc(doc(db, "recruiters", recruiter.email), recruiter);
};

// Job Posting: Fetch jobs with pagination
export const fetchJobs = async (filters = [], pageSize = 10, lastJobRef = null) => {
  return fetchPaginatedResults("jobs", filters, pageSize, lastJobRef);
};

// Search Students by Campus with Pagination
export const searchStudentsByCampus = async (instituteId, pageSize = 10, lastStudentRef = null) => {
  return fetchPaginatedResults("students", [["instituteId", "==", instituteId]], pageSize, lastStudentRef);
};

export default db;