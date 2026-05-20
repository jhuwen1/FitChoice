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

    const [showClavicularHead, setShowClavicularHead] = useState(false);
    const [selectedClavicularHead, setSelectedClavicularHead] = useState("");

    const [showSternalHead, setShowSternalHead] = useState(false);
    const [selectedSternalHead, setSelectedSternalHead] = useState("");

    // EXERCISE DATA - Static arrays of exercise objects
    // Each exercise has an id and name
    const upperBack = [
      { id: "1", name: "Chest-supported Rows" },
      { id: "2", name: "Face Pulls" },
      { id: "3", name: "Wide-grip Pull-ups" },
      { id: "4", name: "Wide-grip Lat Pulldowns" },
      { id: "5", name: "High Cable Rows" },
      { id: "6", name: "Reverse Pec Deck Flys" },
      { id: "7", name: "Seal Rows" },
      { id: "8", name: "Single-arm Cable Rows" },
    ];

    const midBack = [
    { id: "1", name: "Barbell Bent-Over Row" },
    { id: "2", name: "Chest-Supported Row" },
    { id: "3", name: "Seated Cable Row" },
    { id: "4", name: "T-Bar Row" },
    { id: "5", name: "One-Arm Dumbbell Row" },
    { id: "6", name: "Wide-Grip Cable Row" },
    { id: "7", name: "Incline Dumbbell Row" },
    { id: "8", name: "Reverse Pec Deck (Rear Delt Fly)" },
    ];

    const lowerBack = [
      { id: "1", name: "Romanian Deadlift" },
      { id: "2", name: "Conventional Deadlift" },
      { id: "3", name: "Good Mornings" },
      { id: "4", name: "Back Extensions (Hyperextensions)" },
      { id: "5", name: "Reverse Hyperextensions" },
      { id: "6", name: "Rack Pulls (Below Knee)" },
      { id: "7", name: "Bird Dog (Stability Exercise)" },
      { id: "8", name: "Superman Holds" },
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

    const forearms = [
      { id: "1", name: "Wrist Curl (Seated)" },
      { id: "2", name: "Reverse Wrist Curl" },
      { id: "3", name: "Hammer Curl" },
      { id: "6", name: "Plate Pinch Hold" },
      { id: "7", name: "Zottman Curl" },
    ];

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
          style={styles.btn1Open}>

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
          <Pressable onPress={() => router.push("/dayaa")}>
            <Text style={styles.btnText}>B/C</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/leg")}>
            <Text style={[styles.btnText2 ]}>L/S</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/index")}>
            <Text style={[ styles.btnText3 ]}>B/C</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/leg")}>
            <Text style={[ styles.btnText4 ]}>L/S</Text>
          </Pressable>

          

        </View>

        {/* RENDER 5 EXERCISE BOXES - Each one uses the same renderExerciseBox function */}
        {/* This is DRY (Don't Repeat Yourself) - one function, reused 5 times */}
        
        {/* Upper back box */}
        {renderExerciseBox("Upper back", upperBack, showText, setShowText, selectedExercise, setSelectedExercise)}
        
        {/* Mid back box */}
        {renderExerciseBox("Mid back", midBack, showMidBack, setShowMidBack, selectedMidBack, setSelectedMidBack)}

        {/* Clavicular head box */}
        {renderExerciseBox("Clavicular head", clavicularHead, showClavicularHead, setShowClavicularHead, selectedClavicularHead, setSelectedClavicularHead)}
        
        {/* Lower back box */}
        {renderExerciseBox("Lower back", lowerBack, showLowerBack, setShowLowerBack, selectedLowerBack, setSelectedLowerBack)}

        {/* Sternal head box */}
        {renderExerciseBox("Sternal head", sternalHead, showSternalHead, setShowSternalHead, selectedSternalHead, setSelectedSternalHead)}
        
        {/* Biceps box */}
        {renderExerciseBox("Biceps", biceps, showBiceps, setShowBiceps, selectedBiceps, setSelectedBiceps)}
        
        {/* Forearms box */}
        {renderExerciseBox("Forearms", forearms, showForearms, setShowForearms, selectedForearms, setSelectedForearms)}

 


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