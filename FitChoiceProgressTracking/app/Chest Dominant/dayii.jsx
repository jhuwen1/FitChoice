import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function Day2() {
  const router = useRouter();
  
  // STATE FOR QUADS
  const [showQuads, setShowQuads] = useState(false);
  const [selectedQuads, setSelectedQuads] = useState("");
  
  // STATE FOR HAMSTRINGS
  const [showHamstrings, setShowHamstrings] = useState(false);
  const [selectedHamstrings, setSelectedHamstrings] = useState("");
  
  // STATE FOR GLUTES
  const [showGlutes, setShowGlutes] = useState(false);
  const [selectedGlutes, setSelectedGlutes] = useState("");
  
  // STATE FOR CALVES
  const [showCalves, setShowCalves] = useState(false);
  const [selectedCalves, setSelectedCalves] = useState("");
  
  // STATE FOR CORE
  const [showCore, setShowCore] = useState(false);
  const [selectedCore, setSelectedCore] = useState("");
  
  // STATE FOR FOREARMS
  const [showForearms, setShowForearms] = useState(false);
  const [selectedForearms, setSelectedForearms] = useState("");

  // EXERCISE DATA
  const quads = [
    { id: "1", name: "Barbell Back Squat" },
    { id: "2", name: "Barbell Front Squat" },
    { id: "3", name: "Leg Press" },
    { id: "4", name: "Smith Machine Squat" },
    { id: "5", name: "Hack Squat" },
    { id: "6", name: "V-Squat" },
    { id: "7", name: "Leg Extension" },
    { id: "8", name: "Pendulum Squat" },
  ];

  const hamstrings = [
    { id: "1", name: "Romanian Deadlift" },
    { id: "2", name: "Conventional Deadlift" },
    { id: "3", name: "Lying Leg Curl" },
    { id: "4", name: "Seated Leg Curl" },
    { id: "5", name: "Standing Leg Curl" },
    { id: "6", name: "Nordic Curls" },
    { id: "7", name: "Good Mornings" },
    { id: "8", name: "Glute-Ham Raise" },
  ];

  const glutes = [
    { id: "1", name: "Barbell Hip Thrust" },
    { id: "2", name: "Smith Machine Hip Thrust" },
    { id: "3", name: "Bulgarian Split Squat" },
    { id: "4", name: "Pendulum Squat" },
    { id: "5", name: "Leg Press (Wide Stance)" },
    { id: "6", name: "Machine Leg Press (Glute Focused)" },
    { id: "7", name: "Cable Pull Through" },
    { id: "8", name: "Dumbbell Step-Ups" },
  ];

  const calves = [
    { id: "1", name: "Machine Calf Raise" },
    { id: "2", name: "Seated Calf Raise" },
    { id: "3", name: "Standing Calf Raise" },
    { id: "4", name: "Leg Press Calf Raise" },
    { id: "5", name: "Dumbbell Calf Raise" },
    { id: "6", name: "Barbell Calf Raise" },
    { id: "7", name: "Smith Machine Calf Raise" },
    { id: "8", name: "Jump Rope" },
  ];

  const core = [
    { id: "1", name: "Ab Wheel Rollout" },
    { id: "2", name: "Cable Crunch" },
    { id: "3", name: "Machine Crunch" },
    { id: "4", name: "Decline Sit-ups" },
    { id: "5", name: "Hanging Leg Raise" },
    { id: "6", name: "Rope Cable Crunch" },
    { id: "7", name: "Machine Abs" },
    { id: "8", name: "Plate Weighted Sit-up" },
  ];

  const forearms = [
    { id: "1", name: "Wrist Curl (Seated)" },
    { id: "2", name: "Reverse Wrist Curl" },
    { id: "3", name: "Hammer Curl" },
    { id: "4", name: "Plate Pinch Hold" },
    { id: "5", name: "Zottman Curl" },
    { id: "6", name: "Farmer's Carry" },
    { id: "7", name: "Reverse Curl" },
    { id: "8", name: "Wrist Roller" },
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
          <Pressable onPress={() => router.push("/dayi")}>
            <Text style={styles.btnText}>C/B</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/dayii")}>
            <Text style={[styles.btnText2]}>Legs</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/dayi")}>
            <Text style={[styles.btnText3]}>C/B</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/dayii")}>
            <Text style={[styles.btnText4]}>Legs</Text>
          </Pressable>
        </View>

        {/* RENDER 6 EXERCISE BOXES */}
        {renderExerciseBox("Quads", quads, showQuads, setShowQuads, selectedQuads, setSelectedQuads)}
        
        {renderExerciseBox("Hamstrings", hamstrings, showHamstrings, setShowHamstrings, selectedHamstrings, setSelectedHamstrings)}

        {renderExerciseBox("Glutes", glutes, showGlutes, setShowGlutes, selectedGlutes, setSelectedGlutes)}
        
        {renderExerciseBox("Calves", calves, showCalves, setShowCalves, selectedCalves, setSelectedCalves)}

        {renderExerciseBox("Core", core, showCore, setShowCore, selectedCore, setSelectedCore)}
        
        {renderExerciseBox("Forearms", forearms, showForearms, setShowForearms, selectedForearms, setSelectedForearms)}

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
