import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  
  // STATE MANAGEMENT FOR DROPDOWNS AND SELECTIONS
  const [showBicepsLong, setShowBicepsLong] = useState(false);
  const [selectedBicepsLong, setSelectedBicepsLong] = useState("");
  
  const [showBicepsShort, setShowBicepsShort] = useState(false);
  const [selectedBicepsShort, setSelectedBicepsShort] = useState("");
  
  const [showClavicular, setShowClavicular] = useState(false);
  const [selectedClavicular, setSelectedClavicular] = useState("");
  
  const [showBrachialis, setShowBrachialis] = useState(false);
  const [selectedBrachialis, setSelectedBrachialis] = useState("");
  
  const [showTricepsLong, setShowTricepsLong] = useState(false);
  const [selectedTricepsLong, setSelectedTricepsLong] = useState("");

  const [showTricepsLateral, setShowTricepsLateral] = useState(false);
  const [selectedTricepsLateral, setSelectedTricepsLateral] = useState("");

  const [showSternal, setShowSternal] = useState(false);
  const [selectedSternal, setSelectedSternal] = useState("");

  const [showForearms, setShowForearms] = useState(false);
  const [selectedForearms, setSelectedForearms] = useState("");

  // EXERCISE POOLS (8 PER MUSCLE GROUP)
  const bicepsLong = [
    { id: "1", name: "Incline Dumbbell Curl" },
    { id: "2", name: "Drag Curl" },
    { id: "3", name: "Barbell Curl (Narrow Grip)" },
    { id: "4", name: "Bayesian Curl (Cable)" },
    { id: "5", name: "Dumbbell Alternate Biceps Curl" },
    { id: "6", name: "Seated Cable Curl (Behind Body)" },
    { id: "7", name: "EZ-Bar Curl (Narrow Grip)" },
    { id: "8", name: "Prone Incline Incline Curl" },
  ];

  const bicepsShort = [
    { id: "1", name: "Preacher Curl" },
    { id: "2", name: "Spider Curl" },
    { id: "3", name: "Concentration Curl" },
    { id: "4", name: "High Cable Curl (Crucifix)" },
    { id: "5", name: "Barbell Curl (Wide Grip)" },
    { id: "6", name: "Machine Preacher Curl" },
    { id: "7", name: "EZ-Bar Preacher Curl" },
    { id: "8", name: "Prone Dumbbell Spider Curl" },
  ];

  const clavicular = [
    { id: "1", name: "Low-to-High Cable Fly" },
    { id: "2", name: "30° Incline Dumbbell Press" },
    { id: "3", name: "Incline Smith Machine Press" },
    { id: "4", name: "Incline Cable Fly" },
    { id: "5", name: "Incline Barbell Bench Press" },
    { id: "6", name: "Incline Hammer Strength Press" },
    { id: "7", name: "Reverse-Grip Bench Press" },
    { id: "8", name: "Feet-Elevated Push-Up" },
  ];

  const brachialis = [
    { id: "1", name: "Dumbbell Hammer Curl" },
    { id: "2", name: "Rope Cable Hammer Curl" },
    { id: "3", name: "Reverse Barbell Curl" },
    { id: "4", name: "Reverse EZ-Bar Curl" },
    { id: "5", name: "Preacher Hammer Curl" },
    { id: "6", name: "Cross-Body Hammer Curl" },
    { id: "7", name: "Seated Incline Hammer Curl" },
    { id: "8", name: "Reverse Cable Curl (Straight Bar)" },
  ];

  const tricepsLong = [
    { id: "1", name: "Overhead Dumbbell Extension" },
    { id: "2", name: "EZ-Bar Skull Crushers" },
    { id: "3", name: "Incline Cable Overhead Extension" },
    { id: "4", name: "DB Skull Crushers (Flat)" },
    { id: "5", name: "Seated Overhead Cable Extension" },
    { id: "6", name: "Barbell JM Press" },
    { id: "7", name: "Dumbbell JM Press" },
    { id: "8", name: "Cable Skull Crushers" },
  ];

  const tricepsLateral = [
    { id: "1", name: "Triceps Rope Pushdown" },
    { id: "2", name: "Straight Bar Pushdown" },
    { id: "3", name: "Diamond Push-ups" },
    { id: "4", name: "V-Bar Cable Pushdown" },
    { id: "5", name: "Weighted Triceps Dips" },
    { id: "6", name: "Single-Arm Cable Pushdown" },
    { id: "7", name: "Machine Triceps Dip" },
    { id: "8", name: "Dumbbell Triceps Kickbacks" },
  ];

  const sternal = [
    { id: "1", name: "Flat Barbell Bench Press" },
    { id: "2", name: "Flat Dumbbell Press" },
    { id: "3", name: "Pec Deck Fly" },
    { id: "4", name: "Flat Cable Fly" },
    { id: "5", name: "Hammer Strength Chest Press" },
    { id: "6", name: "Smith Machine Flat Bench" },
    { id: "7", name: "Weighted Chest Dip (Lean Forward)" },
    { id: "8", name: "Dumbbell Chest Fly" },
  ];

  const forearms = [
    { id: "1", name: "Wrist Curl (Seated)" },
    { id: "2", name: "Reverse Wrist Curl" },
    { id: "3", name: "Plate Pinch Hold" },
    { id: "4", name: "Barbell Behind-the-Back Wrist Curl" },
    { id: "5", name: "Zottman Curl" },
    { id: "6", name: "Wrist Roller" },
    { id: "7", name: "Farmers Walk" },
    { id: "8", name: "Dumbbell Suitcase Hold" },
  ];

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
                  console.log(exercise.name);
                  setSelectedState(exercise.name);
                  setShowState(false);
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "#444" : "#222",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 10,
                    width: 250,
                    height: 50,
                  },
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
          <Pressable onPress={() => router.push("/daya")}>
            <Text style={styles.btnText}>C/A</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/dayaa")}>
            <Text style={[styles.btnText2]}>B/L</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/daya")}>
            <Text style={[styles.btnText3]}>C/A</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/dayaa")}>
            <Text style={[styles.btnText4]}>B/L</Text>
          </Pressable>
        </View>

        {renderExerciseBox("Biceps Long Head (2 sets)", bicepsLong, showBicepsLong, setShowBicepsLong, selectedBicepsLong, setSelectedBicepsLong)}
        {renderExerciseBox("Biceps Short Head (2 sets)", bicepsShort, showBicepsShort, setShowBicepsShort, selectedBicepsShort, setSelectedBicepsShort)}
        {renderExerciseBox("Clavicular (Upper Chest) (2 sets)", clavicular, showClavicular, setShowClavicular, selectedClavicular, setSelectedClavicular)}
        {renderExerciseBox("Brachialis (2 sets)", brachialis, showBrachialis, setShowBrachialis, selectedBrachialis, setSelectedBrachialis)}
        {renderExerciseBox("Triceps Long Head (2 sets)", tricepsLong, showTricepsLong, setShowTricepsLong, selectedTricepsLong, setSelectedTricepsLong)}
        {renderExerciseBox("Triceps Lateral Head (2 sets)", tricepsLateral, showTricepsLateral, setShowTricepsLateral, selectedTricepsLateral, setSelectedTricepsLateral)}
        {renderExerciseBox("Sternal (Mid Chest) (2 sets)", sternal, showSternal, setShowSternal, selectedSternal, setSelectedSternal)}
        {renderExerciseBox("Forearms (2 sets)", forearms, showForearms, setShowForearms, selectedForearms, setSelectedForearms)}
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
});