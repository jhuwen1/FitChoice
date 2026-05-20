import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebaseConfig";

export async function uploadFoodScan(uri) {
  const uid = auth.currentUser.uid;
  const id = Date.now().toString();

  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new TypeError("Network request failed"));
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const storageRef = ref(storage, `foodScans/${uid}/${id}.jpg`);

  await uploadBytes(storageRef, blob);

  blob.close?.();

  const url = await getDownloadURL(storageRef);

  const nutritionalData = {
    calories: 130,
    protein: 5,
    carbs: 20,
    fats: 4,
  };

  await setDoc(
    doc(db, "users", uid, "macros", id),
    {
      imageUrl: url,
      ...nutritionalData,
      timestamp: Date.now(),
    },
    { merge: true },
  );
}
