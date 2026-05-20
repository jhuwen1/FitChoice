import { db, auth } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';

export const saveProgressEntry = async (weight, height) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    try {
        const docRef = await addDoc(collection(db, "progress_logs"), {
            userId: user.uid,
            weight: parseFloat(weight),
            height: parseFloat(height),
            createdAt: serverTimestamp(), // Pang sort mamaya Jhuwen
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding progress: ", error);
        throw error;
    }
};

export const getProgressHistory = async () => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
        collection(db, "progress_logs"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// NEW: Function to save the selected exercises
export const saveWorkoutSession = async (splitName, selectedExercises) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    try {
        const docRef = await addDoc(collection(db, "workout_logs"), {
            userId: user.uid,
            splitName: splitName,
            exercises: selectedExercises,
            createdAt: serverTimestamp(), 
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving workout session: ", error);
        throw error;
    }
};