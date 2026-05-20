import React, { useState } from "react";
import { StyleSheet, Text, View, Button, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function App() {
  const router = useRouter();
  
  // STATE FOR UPPER BACK
  // showText: boolean to toggle dropdown visibility
  // selectedExercise: stores the name of the selected exercise
  const [showText, setShowText] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");
  
  // STATE FOR MID BACK
  const [showMidBack, setShowMidBack] = useState(false);
  const [selectedMidBack, setSelectedMidBack] = useState("");
  
  // STATE FOR LOWER BACK
  const [showLowerBack, setShowLowerBack] = useState(false);
  const [selectedLowerBack, setSelectedLowerBack] = useState("");
  
  // STATE FOR BICEPS
  const [showBiceps, setShowBiceps] = useState(false);
  const [selectedBiceps, setSelectedBiceps] = useState("");
  
  // STATE FOR FOREARMS
  const [showForearms, setShowForearms] = useState(false);
  const [selectedForearms, setSelectedForearms] = useState("");

  //state for quads
  const [showQuads, setShowQuads] = useState(false);
  const [selectedQuads, setSelectedQuads] = useState("");

  //state for hamstrings  
  const [showHamstrings, setShowHamstrings] = useState(false);
  const [selectedHamstrings, setSelectedHamstrings] = useState("");

  //state for glutes
  const [showGlutes, setShowGlutes] = useState(false);
  const [selectedGlutes, setSelectedGlutes] = useState("");

  //state for calves
  const [showCalves, setShowCalves] = useState(false);
  const [selectedCalves, setSelectedCalves] = useState("");

  //state for adductors
  const [showAdductors, setShowAdductors] = useState(false);
  const [selectedAdductors, setSelectedAdductors] = useState("");

  //state for core
  const [showCore, setShowCore] = useState(false);
  const [selectedCore, setSelectedCore] = useState("");

  //state for medial delts  
  const [showMedialDelts, setShowMedialDelts] = useState(false);
  const [selectedMedialDelts, setSelectedMedialDelts] = useState("");
  


  // EXERCISE DATA - Static arrays of exercise objects
  // Each exercise has an id and name

const quads = [
  { id: "1", name: "Back Squat" },
  { id: "2", name: "Leg Press" },
  { id: "3", name: "Leg Extension" },
  { id: "4", name: "Hack Squat" },
  { id: "5", name: "Bulgarian Split Squat (Quad Bias)" },
  { id: "6", name: "Front Squat" },
  { id: "7", name: "Sissy Squat" },
  { id: "8", name: "Step-Ups" },
];

const hamstrings = [
  { id: "1", name: "Romanian Deadlift" },
  { id: "2", name: "Lying Leg Curl" },
  { id: "3", name: "Seated Leg Curl" },
  { id: "4", name: "Good Morning" },
  { id: "5", name: "Glute-Ham Raise" },
  { id: "6", name: "Single-Leg RDL" },
  { id: "7", name: "Cable Pull-Through" },
  { id: "8", name: "Nordic Curl" },
];

const glutes = [
  { id: "1", name: "Hip Thrust" },
  { id: "2", name: "Glute Bridge" },
  { id: "3", name: "Cable Kickback" },
  { id: "4", name: "Sumo Deadlift" },
  { id: "5", name: "Bulgarian Split Squat (Glute Bias)" },
  { id: "6", name: "Frog Pumps" },
  { id: "7", name: "Step-Ups (Glute Focus)" },
  { id: "8", name: "Hip Abduction Machine" },
];

const calves = [
  { id: "1", name: "Standing Calf Raise" },
  { id: "2", name: "Seated Calf Raise" },
  { id: "3", name: "Donkey Calf Raise" },
  { id: "4", name: "Single-Leg Calf Raise" },
  { id: "5", name: "Leg Press Calf Raise" },
  { id: "6", name: "Smith Machine Calf Raise" },
  { id: "7", name: "Jump Rope" },
  { id: "8", name: "Calf Raise on Step (Deep Stretch)" },
];

const adductors = [
  { id: "1", name: "Adductor Machine" },
  { id: "2", name: "Copenhagen Plank" },
  { id: "3", name: "Sumo Squat" },
  { id: "4", name: "Side Lunges" },
  { id: "5", name: "Cable Hip Adduction" },
  { id: "6", name: "Sliding Adduction (Towel/Discs)" },
  { id: "7", name: "Wide Stance Leg Press" },
  { id: "8", name: "Band Adduction" },
];

const core = [
  { id: "1", name: "Plank" },
  { id: "2", name: "Hanging Leg Raise" },
  { id: "3", name: "Crunch" },
  { id: "4", name: "Bicycle Crunch" },
  { id: "5", name: "Ab Wheel Rollout" },
  { id: "6", name: "Dead Bug" },
  { id: "7", name: "Russian Twist" },
  { id: "8", name: "Cable Crunch" },
];

    const forearms = [
      { id: "1", name: "Wrist Curl (Seated)" },
      { id: "2", name: "Reverse Wrist Curl" },
      { id: "3", name: "Hammer Curl" },
      { id: "6", name: "Plate Pinch Hold" },
      { id: "7", name: "Zottman Curl" },
    ];

    const medialDelts = [
    { id: "1", name: "Machine Lateral Raise" },
    { id: "2", name: "Cable Lateral Raise" },
    { id: "3", name: "Dumbbell Lateral Raise" },
      ];
  // HELPER FUNCTION - renderExerciseBox
  // This function creates ONE exercise box that can be reused for any muscle group
  // Parameters:
  //   title: The muscle group name (e.g., "Upper back")
  //   exercises: The array of exercise objects for that muscle group
  //   showState: Boolean state controlling if dropdown is visible
  //   setShowState: Function to toggle the dropdown visibility
  //   selectedState: The selected exercise name displayed at top
  //   setSelectedState: Function to update the selected exercise
  const renderExerciseBox = (title, exercises, showState, setShowState, selectedState, setSelectedState) => (
    <View style={styles.box1}>
      {/* Title of muscle group - positioned at top left */}
      <Text style={styles.box1Text}>{title}</Text>

      {/* Display the currently selected exercise - positioned in center */}
      <Text style={styles.selectedExcercise}>{selectedState}</Text>

      {/* Button to toggle dropdown - shows/hides exercise list */}
      <Pressable
        onPress={() => setShowState((prev) => !prev)}  // Toggle dropdown on press
        style={styles.btn1Open}
      >
        {/* "v" arrow that points down */}
        <Text style={{ color: "white", top: 25, fontSize: 25, position: "absolute" }}>v</Text>
      </Pressable>

      {/* CONDITIONAL RENDERING - Only show the list if showState is true */}
      {showState && (
        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
          <View>
            {/* MAP FUNCTION - Loop through all exercises in the array */}
            {exercises.map((exercise) => (
              <Pressable
                key={exercise.id}  // Unique identifier for each exercise
                onPress={() => {
                  console.log(exercise.name);  // Log the selected exercise
                  setSelectedState(exercise.name);  // Update the selected exercise
                  setShowState(false);  // Close the dropdown after selection
                }}
                style={({ pressed }) => [
                  {
                    // Change color when pressed
                    backgroundColor: pressed ? "#444" : "#222",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 10,
                    width: 250,
                    height: 50,
                  },
                ]}
              >
                {/* Display the exercise name */}
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

  // MAIN RENDER FUNCTION - JSX that displays on screen
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
    <View style={styles.container}>
      {/* Header section at top */}
      <View style={styles.header}>
        <Text style={styles.text}>Back Dominant</Text>
      </View>

        <View>
          <Pressable onPress={() => router.push("/index")}>
            <Text style={styles.btnText}>B/C</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/leg")}>
            <Text style={[styles.btnText2 ]}>L/S</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/push")}>
            <Text style={[ styles.btnText3 ]}>B/C</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/leg")}>
            <Text style={[ styles.btnText4 ]}>L/S</Text>
          </Pressable>

        

      </View>
      

      {/* RENDER 5 EXERCISE BOXES - Each one uses the same renderExerciseBox function */}
      {/* This is DRY (Don't Repeat Yourself) - one function, reused 5 times */}

      {/* Quads box */}
      {renderExerciseBox("Quads", quads, showQuads, setShowQuads, selectedQuads, setSelectedQuads)}

      {/*medial Delts box*/}
      {renderExerciseBox("Medial Delts", medialDelts, showMedialDelts, setShowMedialDelts, selectedMedialDelts, setSelectedMedialDelts)}

      {/* Hamstrings box */}
      {renderExerciseBox("Hamstrings", hamstrings, showHamstrings, setShowHamstrings, selectedHamstrings, setSelectedHamstrings)}
      
      {/* Glutes box */}
      {renderExerciseBox("Glutes", glutes, showGlutes, setShowGlutes, selectedGlutes, setSelectedGlutes)}

      {/* Calves box */}
      {renderExerciseBox("Calves", calves, showCalves, setShowCalves, selectedCalves, setSelectedCalves)}

      {/* Adductors box */}
      {renderExerciseBox("Adductors", adductors, showAdductors, setShowAdductors, selectedAdductors, setSelectedAdductors)}

      {/* Forearms box */}
      {renderExerciseBox("Forearms", forearms, showForearms, setShowForearms, selectedForearms, setSelectedForearms)}

      {/* Core box */}
      {renderExerciseBox("Core", core, showCore, setShowCore, selectedCore, setSelectedCore)}


    </View>
    </ScrollView>
  );
}

// STYLESHEET - Defines all the styling for the app
// These styles are reused throughout the component
const styles = StyleSheet.create({
  // Main container that wraps everything
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",  // Center items horizontally
    justifyContent: "flex-start",  // Push content to top
    backgroundColor: "#1E1C2B",  // Dark background color
  },

  // Title text styling at the top
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  // Header container
  header: {
    marginTop: 50,  // Space from top
  },

  // THE BOX STYLE - This is applied to all 5 exercise boxes
  // Same style, different content = same look for all boxes
  box1: {
    width: 260,
    minHeight: 100,
    backgroundColor: "gray",
    justifyContent: "center",  // Center content vertically
    alignItems: "center",  // Center content horizontally
    borderRadius: 10,  // Rounded corners
    marginTop: 20,  // Space between boxes
    padding: 10,
  },

  // Title text inside each box (e.g., "Upper back")
  box1Text: {
    position: "absolute",  // Take it out of normal flow
    top: 10,  // Position 10px from top
    left: 10,  // Position 10px from left
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Selected exercise text display
  selectedExcercise: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    position: "absolute",  // Position in center
  },

  // Dropdown button styling
  btn1Open: {
    marginTop: 20,
    height: 30,
    width: 50,
    justifyContent: "center",  // Center the arrow vertically
    alignItems: "center",  // Center the arrow horizontally
  },

  day: {
    color: "white",
    fontSize: 18,
    marginTop: 5,
    marginHorizontal: 50,
  },

    btnText: {
    color: "white",
    fontSize: 20,
    position: "absolute",
    right: 80,
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
    left: 10,
    bottom: -20,
  },

  btnText4: {
    color: "white",
    fontSize: 20,
    position: "absolute",
    left: 90,
    bottom: -20,
  },

});
