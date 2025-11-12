import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { db } from "../firebase";

export async function loginAdmin(username, password) {
  if (!username || !password) {
    toast.error("Username and password are required");
    return false;
  }

  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    toast.error("User not found");
    return false;
  }

  const userData = userSnap.data();
  if (!userData) {
    toast.error("User data not found");
    return false;
  }

  const { passwordHash, role } = userData;

  if (role !== "admin") {
    toast.error("Not an admin account");
    return false;
  }

  const isValid = await bcrypt.compare(password, passwordHash);
  if (!isValid) {
    toast.error("Incorrect password");
    return false;
  }

  localStorage.setItem("adminUsername", username); // persist login
  toast.success("Logged in successfully");
  return true;
}

export default loginAdmin;
