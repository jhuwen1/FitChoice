import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function Day1() {
  const router = useRouter();
  
  // STATE FOR CLAVICULAR HEAD
  const [showClavicularHead, setShowClavicularHead] = useState(false);
  const [selectedClavicularHead, setSelectedClavicularHead] = useState("");
  
  // STATE FOR STERNAL HEAD
  const [showSternalHead, setShowSternalHead] = useState(false);
  const [selectedSternalHead, setSelectedSternalHead] = useState("");
  
  // STATE FOR UPPER BACK
  const [showUpperBack, setShowUpperBack] = useState(false);
  const [selectedUpperBack, setSelectedUpperBack] = useState("");
  
  // STATE FOR MID & LOWER BACK
  const [showMidLowerBack, setShowMidLowerBack] = useState(false);
  const [selectedMidLowerBack, setSelectedMidLowerBack] = useState("");
  
  // STATE FOR SIDE DELTS
  const [showSideDelts, setShowSideDelts] = useState(false);
  const [selectedSideDelts, setSelectedSideDelts] = useState("");
  
  // STATE FOR BICEPS
  const [showBiceps, setShowBiceps] = useState(false);
  const [selectedBiceps, setSelectedBiceps] = useState("");
  
  // STATE FOR TRICEPS
  const [showTriceps, setShowTriceps] = useState(false);
  const [selectedTriceps, setSelectedTriceps] = useState("");

  // EXERCISE DATA - Static arrays of exercise objects
  const clavicularHead = [
    { id: "1", name: "Low-to-High Cable Fly" },
    { id: "2", name: "30° Incline Smith Machine Press" },
    { id: "3", name: "Incline Cable Fly" },
    { id: "4", name: "Reverse-Grip Smith Machine Bench Press" },
    { id: "5", name: "30° Incline Dumbbell Press" },
    { id: "6", name: "Single-Arm Incline Cable Press" },
    { id: "7", name: "Guillotine Press (Low Incline)" },
    { id: "8", name: "Feet-Elevated Deficit Push-Up" },
  ];

  const sternalHead = [
    { id: "1", name: "Flat Cable Fly" },
    { id: "2", name: "Pec Deck Fly" },
    { id: "3", name: "Flat Dumbbell Press" },
    { id: "4", name: "Smith Machine Flat Bench Press" },
    { id: "5", name: "Wide-Grip Barbell Bench Press" },
    { id: "6", name: "Machine Chest Press" },
    { id: "7", name: "Weighted Chest Dip (Forward Lean)" },
    { id: "8", name: "Flat Dumbbell Fly" },
  ];

  const upperBack = [
    { id: "1", name: "Chest-supported Row" },
    { id: "2", name: "Face Pulls" },
    { id: "3", name: "Wide-grip Pull-ups" },
    { id: "4", name: "Wide-grip Lat Pulldowns" },
    { id: "5", name: "High Cable Rows" },
    { id: "6", name: "Reverse Pec Deck Flys" },
    { id: "7", name: "Seal Rows" },
    { id: "8", name: "Single-arm Cable Rows" },
  ];

  const midLowerBack = [
    { id: "1", name: "Barbell Bent-Over Row" },
    { id: "2", name: "Romanian Deadlift" },
    { id: "3", name: "Good Mornings" },
    { id: "4", name: "T-Bar Row" },
    { id: "5", name: "One-Arm Dumbbell Row" },
    { id: "6", name: "Back Extensions" },
    { id: "7", name: "Incline Dumbbell Row" },
    { id: "8", name: "Seated Cable Row" },
  ];

  const sideDelts = [
    { id: "1", name: "Machine Lateral Raise" },
    { id: "2", name: "Cable Lateral Raise" },
    { id: "3", name: "Dumbbell Lateral Raise" },
    { id: "4", name: "Smith Machine Lateral Raise" },
    { id: "5", name: "Lever Lateral Raise" },
    { id: "6", name: "Plate Raise" },
    { id: "7", name: "Band Lateral Raise" },
    { id: "8", name: "Resistance Band Pull Apart" },
  ];

  const biceps = [
    { id: "1", name: "Barbell Curl" },
    { id: "2", name: "EZ-Bar Curl" },
    { id: "3", name: "Incline Dumbbell Curl" },
    { id: "4", name: "Hammer Curl" },
    { id: "5", name: "Preacher Curl" },
    { id: "6", name: "Cable Curl (Straight Bar)" },
    { id: "7", name: "Concentration Curl" },
    { id: "8", name: "Spider Curl" },
  ];

  const triceps = [
    { id: "1", name: "Tricep Rope Pushdown" },
    { id: "2", name: "Overhead Rope Extension" },
    { id: "3", name: "Tricep Dips" },
    { id: "4", name: "Skull Crushers" },
    { id: "5", name: "Close-Grip Bench Press" },
    { id: "6", name: "Dumbbell Kickback" },
    { id: "7", name: "EZ-Bar Skull Crusher" },
    { id: "8", name: "Machine Tricep Press" },
  ];

  // HELPER FUNCTION - renderExerciseBox
  const renderExerciseBox = (title, exercises, showState, setShowState, selectedState, setSelectedState) => (
    <View style={styles.box1}>
      {/* Title of muscle group - positioned at top left */}
      <Text style={styles.box1Text}>{title}</Text>

      {/* Display the currently selected exercise - positioned in center */}
      <Text style={styles.selectedExcercise}>{selectedState}</Text>

      {/* Button to toggle dropdown - shows/hides exercise list */}
      <Pressable
        onPress={() => setShowState((prev) => !prev)}
        style={styles.btn1Open}>
        <Text style={{ color: "white", top: 25, fontSize: 25, position: "absolute" }}>v</Text>
      </Pressable>

      {/* CONDITIONAL RENDERING - Only show the list if showState is true */}
      {showState && (
        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
          <View>
            {/* MAP FUNCTION - Loop through all exercises in the array */}
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
                <Text style={{ color: "white", fontSize: 11 }}>
                  {exercise.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  // MAIN RENDER FUNCTION
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Header section at top */}
        <View style={styles.header}>
          <Text style={styles.text}>Chest Dominant</Text>
        </View>

        <View>
          <Pressable onPress={() => router.push("/day1")}>
            <Text style={styles.btnText}>C/B</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/day2")}>
            <Text style={[styles.btnText2]}>Legs</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/day3")}>
            <Text style={[styles.btnText3]}>C/B</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/day4")}>
            <Text style={[styles.btnText4]}>Legs</Text>
          </Pressable>
        </View>

        {/* RENDER 7 EXERCISE BOXES */}
        {renderExerciseBox("Clavicular Head", clavicularHead, showClavicularHead, setShowClavicularHead, selectedClavicularHead, setSelectedClavicularHead)}
        
        {renderExerciseBox("Sternal Head", sternalHead, showSternalHead, setShowSternalHead, selectedSternalHead, setSelectedSternalHead)}

        {renderExerciseBox("Upper Back", upperBack, showUpperBack, setShowUpperBack, selectedUpperBack, setSelectedUpperBack)}
        
        {renderExerciseBox("Mid & Lower Back", midLowerBack, showMidLowerBack, setShowMidLowerBack, selectedMidLowerBack, setSelectedMidLowerBack)}

        {renderExerciseBox("Side Delts", sideDelts, showSideDelts, setShowSideDelts, selectedSideDelts, setSelectedSideDelts)}
        
        {renderExerciseBox("Biceps", biceps, showBiceps, setShowBiceps, selectedBiceps, setSelectedBiceps)}
        
        {renderExerciseBox("Triceps", triceps, showTriceps, setShowTriceps, selectedTriceps, setSelectedTriceps)}

      </View>
    </ScrollView>
  );
}

// STYLESHEET
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#1E1C2B",
  },

  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  header: {
    marginTop: 50,
  },

  box1: {
    width: 260,
    minHeight: 100,
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
    padding: 10,
  },

  box1Text: {
    position: "absolute",
    top: 10,
    left: 10,
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  selectedExcercise: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    position: "absolute",
  },

  btn1Open: {
    marginTop: 20,
    height: 30,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontSize: 20,
    position: "absolute",
    right: 85,
    bottom: -20,
  },

  btnText2: {
    color: "white",
    fontSize: 20,
    position: "absolute",
    right: 18,
    bottom: -20,
  },

  btnText3: {
    color: "white",
    fontSize: 20,
    position: "absolute",
    left: 15,
    bottom: -20,
  },

  btnText4: {
    color: "white",
    fontSize: 20,
    position: "absolute",
    left: 75,
    bottom: -20,
  },
});
