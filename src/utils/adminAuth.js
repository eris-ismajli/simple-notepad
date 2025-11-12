import { doc, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { db } from "../firebase";

export async function loginAdmin(username, password) {
  if (!username || !password) {
    alert("Username and password are required");
    return false;
  }

  const userRef = doc(db, "users", username);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    alert("User not found");
    return false;
  }

  const userData = userSnap.data();
  if (!userData) {
    alert("User data not found");
    return false;
  }

  const { passwordHash, role } = userData;

  if (role !== "admin") {
    alert("Not an admin account");
    return false;
  }

  const isValid = await bcrypt.compare(password, passwordHash);
  if (!isValid) {
    alert("Incorrect password");
    return false;
  }

  localStorage.setItem("adminUsername", username); // persist login
  return true;
}

export default loginAdmin;
