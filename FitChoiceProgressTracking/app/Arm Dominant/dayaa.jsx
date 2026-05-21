import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { saveWorkoutSession } from "./progressService";

export default function App() {
  const router = useRouter();
  
  const [showQuads, setShowQuads] = useState(false);
  const [selectedQuads, setSelectedQuads] = useState("");
  
  const [showUpperBack, setShowUpperBack] = useState(false);
  const [selectedUpperBack, setSelectedUpperBack] = useState("");
  
  const [showMidBack, setShowMidBack] = useState(false);
  const [selectedMidBack, setSelectedMidBack] = useState("");
  
  const [showLowerBack, setShowLowerBack] = useState(false);
  const [selectedLowerBack, setSelectedLowerBack] = useState("");
  
  const [showRearDelts, setShowRearDelts] = useState(false);
  const [selectedRearDelts, setSelectedRearDelts] = useState("");

  const [showHamstrings, setShowHamstrings] = useState(false);
  const [selectedHamstrings, setSelectedHamstrings] = useState("");

  const [showGlutes, setShowGlutes] = useState(false);
  const [selectedGlutes, setSelectedGlutes] = useState("");

  const [showCalves, setShowCalves] = useState(false);
  const [selectedCalves, setSelectedCalves] = useState("");

  const quads = [
    { id: "1", name: "Barbell Back Squat" }, { id: "2", name: "Leg Press" },
    { id: "3", name: "Hack Squat" }, { id: "4", name: "Leg Extensions" },
    { id: "5", name: "Smith Machine Squat" }, { id: "6", name: "Goblet Squat" },
    { id: "7", name: "Dumbbell Bulgarian Split Squat" }, { id: "8", name: "Pendulum Squat" },
  ];

  const upperBack = [
    { id: "1", name: "Chest-supported Rows" }, { id: "2", name: "Face Pulls" },
    { id: "3", name: "Wide-grip Pull-ups" }, { id: "4", name: "Wide-grip Lat Pulldowns" },
    { id: "5", name: "High Cable Rows" }, { id: "6", name: "Reverse Pec Deck Flys" },
    { id: "7", name: "Seal Rows" }, { id: "8", name: "Single-arm Cable Rows" },
  ];

  const midBack = [
    { id: "1", name: "Barbell Bent-Over Row" }, { id: "2", name: "Chest-Supported Row" },
    { id: "3", name: "Seated Cable Row" }, { id: "4", name: "T-Bar Row" },
    { id: "5", name: "One-Arm Dumbbell Row" }, { id: "6", name: "Wide-Grip Cable Row" },
    { id: "7", name: "Incline Dumbbell Row" }, { id: "8", name: "Meadows Row" },
  ];

  const lowerBack = [
    { id: "1", name: "Romanian Deadlift" }, { id: "2", name: "Conventional Deadlift" },
    { id: "3", name: "Good Mornings" }, { id: "4", name: "Back Extensions (Hyperextensions)" },
    { id: "5", name: "Reverse Hyperextensions" }, { id: "6", name: "Rack Pulls (Below Knee)" },
    { id: "7", name: "Bird Dog (Stability Exercise)" }, { id: "8", name: "Superman Holds" },
  ];

  const rearDelts = [
    { id: "1", name: "Reverse Pec Deck Flys" }, { id: "2", name: "Bent-Over Lateral Raises" },
    { id: "3", name: "Face Pulls (High Pulley)" }, { id: "4", name: "Seated Cable Rear Delt Fly" },
    { id: "5", name: "Incline Dumbbell Rear Delt Row" }, { id: "6", name: "Lying DB Rear Delt Raise" },
    { id: "7", name: "Single-Arm Cross-Body Cable Pull" }, { id: "8", name: "Behind-the-Back Overhead Press" },
  ];

  const hamstrings = [
    { id: "1", name: "Lying Leg Curl" }, { id: "2", name: "Seated Leg Curl" },
    { id: "3", name: "Stiff-Legged Deadlift" }, { id: "4", name: "Dumbbell Romanian Deadlift" },
    { id: "5", name: "Glute-Ham Raise" }, { id: "6", name: "Single-Leg DB RDL" },
    { id: "7", name: "Stability Ball Leg Curl" }, { id: "8", name: "Cable Pull-Through" },
  ];

  const glutes = [
    { id: "1", name: "Barbell Hip Thrusts" }, { id: "2", name: "Bulgarian Split Squats" },
    { id: "3", name: "Cable Pull-Throughs" }, { id: "4", name: "Glute Kickbacks (Cable)" },
    { id: "5", name: "Barbell Glute Bridges" }, { id: "6", name: "Dumbbell Sumo Squat" },
    { id: "7", name: "Deficit Reverse Lunges" }, { id: "8", name: "Machine Hip Abductions" },
  ];

  const calves = [
    { id: "1", name: "Standing Calf Raise" }, { id: "2", name: "Seated Calf Raise" },
    { id: "3", name: "Leg Press Calf Press" }, { id: "4", name: "Smith Machine Calf Raise" },
    { id: "5", name: "Single-Leg Dumbbell Calf Raise" }, { id: "6", name: "Donkey Calf Raise" },
    { id: "7", name: "Bodyweight Tibialis Raise" }, { id: "8", name: "Farmer's Walk on Toes" },
  ];

  const handleSaveWorkout = async () => {
    const workoutData = {
      quads: selectedQuads,
      upperBack: selectedUpperBack,
      midBack: selectedMidBack,
      lowerBack: selectedLowerBack,
      rearDelts: selectedRearDelts,
      hamstrings: selectedHamstrings,
      glutes: selectedGlutes,
      calves: selectedCalves
    };

    const hasSelections = Object.values(workoutData).some(val => val !== "");
    if (!hasSelections) {
      Alert.alert("Empty Workout", "Please select at least one exercise before saving.");
      return;
    }

    try {
      await saveWorkoutSession("Back & Legs (Day AA)", workoutData);
      Alert.alert("Success", "Workout saved to your progress!");
    } catch (error) {
      Alert.alert("Error", "Could not save workout. Please try again.");
    }
  };

  const renderExerciseBox = (title, exercises, showState, setShowState, selectedState, setSelectedState) => (
    <View style={styles.box1}>
      <Text style={styles.box1Text}>{title}</Text>
      <Text style={styles.selectedExcercise}>{selectedState}</Text>
      <Pressable onPress={() => setShowState((prev) => !prev)} style={styles.btn1Open}>
        <Text style={{ color: "white", top: 25, fontSize: 25, position: "absolute" }}>v</Text>
      </Pressable>

      {showState && (
        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
          <View>
            {exercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => {
                  setSelectedState(exercise.name);
                  setShowState(false);
                }}
                style={({ pressed }) => [
                  { backgroundColor: pressed ? "#444" : "#222", padding: 15, borderRadius: 10, marginBottom: 10, width: 250, height: 50 },
                ]}
              >
                <Text style={{ color: "white", fontSize: 11 }}>{exercise.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.text}>Arm Dominant</Text>
        </View>

        <View>
          <Pressable onPress={() => router.push("/daya")}><Text style={styles.btnText}>C/A</Text></Pressable>
          <Pressable onPress={() => router.push("/dayaa")}><Text style={[styles.btnText2]}>B/L</Text></Pressable>
          <Pressable onPress={() => router.push("/daya")}><Text style={[styles.btnText3]}>C/A</Text></Pressable>
          <Pressable onPress={() => router.push("/dayaa")}><Text style={[styles.btnText4]}>B/L</Text></Pressable>
        </View>
        
        {renderExerciseBox("Quads (2 sets)", quads, showQuads, setShowQuads, selectedQuads, setSelectedQuads)}
        {renderExerciseBox("Upper Back (2 sets)", upperBack, showUpperBack, setShowUpperBack, selectedUpperBack, setSelectedUpperBack)}
        {renderExerciseBox("Mid Back (2 sets)", midBack, showMidBack, setShowMidBack, selectedMidBack, setSelectedMidBack)}
        {renderExerciseBox("Lower Back (2 sets)", lowerBack, showLowerBack, setShowLowerBack, selectedLowerBack, setSelectedLowerBack)}
        {renderExerciseBox("Rear Delts (2 sets)", rearDelts, showRearDelts, setShowRearDelts, selectedRearDelts, setSelectedRearDelts)}
        {renderExerciseBox("Hamstrings (2 sets)", hamstrings, showHamstrings, setShowHamstrings, selectedHamstrings, setSelectedHamstrings)}
        {renderExerciseBox("Glutes (2 sets)", glutes, showGlutes, setShowGlutes, selectedGlutes, setSelectedGlutes)}
        {renderExerciseBox("Calves (2 sets)", calves, showCalves, setShowCalves, selectedCalves, setSelectedCalves)}

        <Pressable style={styles.saveButton} onPress={handleSaveWorkout}>
          <Text style={styles.saveButtonText}>Complete Workout</Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: "100%", alignItems: "center", justifyContent: "flex-start", backgroundColor: "#1E1C2B" },
  text: { fontSize: 24, fontWeight: "bold", color: "white" },
  header: { marginTop: 50 },
  box1: { width: 260, minHeight: 100, backgroundColor: "gray", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 20, padding: 10 },
  box1Text: { position: "absolute", top: 10, left: 10, color: "white", fontSize: 11, fontWeight: "bold" },
  selectedExcercise: { color: "white", fontSize: 14, marginTop: 10, position: "absolute" },
  btn1Open: { marginTop: 20, height: 30, width: 50, justifyContent: "center", alignItems: "center" },
  btnText: { color: "white", fontSize: 20, position: "absolute", right: 80, bottom: -20 },
  btnText2: { color: "white", fontSize: 20, position: "absolute", right: 18, bottom: -20 },
  btnText3: { color: "white", fontSize: 20, position: "absolute", left: 10, bottom: -20 },
  btnText4: { color: "white", fontSize: 20, position: "absolute", left: 90, bottom: -20 },
  saveButton: { backgroundColor: "#4CAF50", width: 260, padding: 15, borderRadius: 10, marginTop: 30, marginBottom: 50, alignItems: "center" },
  saveButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});