import { useRouter } from "expo-router";
import React, { Suspense, useRef, useState } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

import { useGLTF, useProgress } from "@react-three/drei/native";
import { Canvas, useFrame } from "@react-three/fiber/native";

const MODELS_DATA = {
  male: [
    { title: "Arm Dominant", file: require("../assets/models/male1.glb") },
    { title: "Back Dominant", file: require("../assets/models/male2.glb") },
    { title: "Chest Dominant", file: require("../assets/models/male3.glb") },
  ],
  female: [
    { title: "Arm Dominant", file: require("../assets/models/male1.glb") },
    { title: "Back Dominant", file: require("../assets/models/male2.glb") },
    { title: "Chest Dominant", file: require("../assets/models/male3.glb") },
  ],
};

MODELS_DATA.male.forEach(item => useGLTF.preload(item.file));
MODELS_DATA.female.forEach(item => useGLTF.preload(item.file));

function RenderedModel({ url, currentScale, interactionRef }) {
  const { scene } = useGLTF(url);

  useFrame(() => {
    if (scene) {
      if (interactionRef.current.isTouching) {
        interactionRef.current.rotation += interactionRef.current.velocity;
        interactionRef.current.velocity *= 0.95; 
      } else {
        interactionRef.current.rotation += 0.003; 
      }
      scene.rotation.y = interactionRef.current.rotation;

      const s = 1.5 * currentScale;
      scene.scale.set(s, s, s);
    }
  });

  return <primitive object={scene} position={[0, -1, 0]} />;
}

export default function SetupScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [index, setIndex] = useState(0);
  const [gender, setGender] = useState("male");

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [showHints, setShowHints] = useState(true);

  const { progress, loaded, total } = useProgress();
  const allModelsReady = progress === 100 || loaded >= total;

  const interactionRef = useRef({
    velocity: 0,
    rotation: 0,
    isTouching: false
  });

  const [scaleFactor, setScaleFactor] = useState(1);
  const lastDistance = useRef(0);

  const currentModels = MODELS_DATA[gender];
  const activeModelAsset = currentModels[index]?.file;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      interactionRef.current.isTouching = true;
      lastDistance.current = 0;
      setShowHints(false);
    },
    onPanResponderMove: (evt, gesture) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 1) {
        interactionRef.current.velocity = gesture.dx * 0.005;
      }
      if (touches.length === 2) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (lastDistance.current) {
          let diff = distance - lastDistance.current;
          setScaleFactor((prev) => Math.max(0.5, Math.min(3, prev + diff * 0.007)));
        }
        lastDistance.current = distance;
      }
    },
    onPanResponderRelease: () => {
      interactionRef.current.isTouching = false;
      lastDistance.current = 0;
    },
    onPanResponderTerminate: () => {
      interactionRef.current.isTouching = false;
      lastDistance.current = 0;
    }
  });

  const handleGenderChange = (targetGender) => {
    if (targetGender === gender) return;
    setGender(targetGender);
    setIndex(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {gender.toUpperCase()} - {currentModels[index]?.title || "Loading..."}
      </Text>

      <View style={styles.genderRow}>
        <Pressable
          style={[styles.genderBtn, gender === "male" && styles.activeBtn]}
          onPress={() => handleGenderChange("male")}
        >
          <Text style={styles.genderText}>Male</Text>
        </Pressable>

        <Pressable
          style={[styles.genderBtn, gender === "female" && styles.activeBtn]}
          onPress={() => handleGenderChange("female")}
        >
          <Text style={styles.genderText}>Female</Text>
        </Pressable>
      </View>

      <View style={styles.viewer} {...panResponder.panHandlers}>
        <Canvas 
          gl={{ antialias: true }} 
          camera={{ fov: 75, position: [0, 0, 4], near: 0.1, far: 1000 }}
          style={StyleSheet.absoluteFill}
        >
          <color attach="background" args={["#0f172a"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 5, 5]} intensity={1.2} />

          <Suspense fallback={null}>
            {activeModelAsset && (
              <RenderedModel 
                url={activeModelAsset} 
                currentScale={scaleFactor}
                interactionRef={interactionRef}
              />
            )}
          </Suspense>
        </Canvas>

        {/* Global Loading Overlay based on actual asset pipeline progress */}
        {!allModelsReady && (
          <View style={[StyleSheet.absoluteFill, styles.loaderOverlay]}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loaderText}>
              Optimizing 3D Environments ({Math.round(progress)}%)
            </Text>
          </View>
        )}

        {showHints && allModelsReady && (
          <View style={styles.hintContainer} pointerEvents="none">
            <Text style={styles.hintText}>Drag to rotate</Text>
            <Text style={styles.hintText}>Pinch to zoom</Text>
          </View>
        )}
      </View>

      <View style={styles.navContainer}>
        <Pressable
          disabled={!allModelsReady}
          onPress={() =>
            setIndex(
              (prev) => (prev - 1 + currentModels.length) % currentModels.length,
            )
          }
        >
          {({ pressed }) => (
            <View style={[styles.chevronBtn, !allModelsReady && { opacity: 0.3 }]}>
              <View
                style={[
                  styles.chevron,
                  styles.leftChevron,
                  pressed && styles.chevronPressed,
                ]}
              />
            </View>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.selectBtn,
            (loading || !allModelsReady) && styles.selectBtnLoading,
            selected && styles.selectBtnSuccess,
          ]}
          disabled={!allModelsReady || loading}
          onPress={async () => {
            if (loading || selected || !user) return;

            setLoading(true);
            try {
              const fullTitle = currentModels[index].title.trim().toLowerCase();
              const splitKey = fullTitle.split(" ")[0];

              await setDoc(
                doc(db, "users", user.uid),
                {
                  goal: fullTitle,
                  bodyGoal: fullTitle,
                  gender: gender,
                },
                { merge: true }
              );

              setLoading(false);
              setSelected(true);

              setTimeout(() => {
                router.push({
                  pathname: "/infoscreen",
                  params: { selectedSplit: splitKey }
                });
              }, 800);
            } catch (err) {
              console.log("Error saving goal:", err);
              setLoading(false);
            }
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : selected ? (
            <Text style={styles.checkMark}>✓</Text>
          ) : (
            <Text style={styles.selectText}>Select Body Goal</Text>
          )}
        </Pressable>

        <Pressable
          disabled={!allModelsReady}
          onPress={() => setIndex((prev) => (prev + 1) % currentModels.length)}
        >
          {({ pressed }) => (
            <View style={[styles.chevronBtn, !allModelsReady && { opacity: 0.3 }]}>
              <View
                style={[
                  styles.chevron,
                  styles.rightChevron,
                  pressed && styles.chevronPressed,
                ]}
              />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    paddingTop: 60,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  genderRow: {
    flexDirection: "row",
    marginBottom: 10,
    zIndex: 10,
  },
  genderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeBtn: {
    backgroundColor: "#f97316",
    borderColor: "#fb923c",
  },
  genderText: {
    color: "#fff",
    fontWeight: "600",
  },
  viewer: {
    width: "100%",
    height: 420,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  loaderOverlay: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5
  },
  hintContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    zIndex: 2,
  },
  hintText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.9,
    fontWeight: "600"
  },
  navContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  chevronBtn: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  chevron: {
    width: 20,
    height: 20,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: "#fff",
  },
  leftChevron: {
    marginTop: 200,
    transform: [{ rotate: "-135deg" }],
  },
  rightChevron: {
    marginTop: 200,
    transform: [{ rotate: "45deg" }],
  },
  selectBtn: {
    flex: 1,
    marginTop: 200,
    marginHorizontal: 10,
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: 'center',
    height: 54
  },
  selectBtnLoading: {
    backgroundColor: "#fb923c",
    opacity: 0.7,
  },
  selectBtnSuccess: {
    backgroundColor: "#22c55e",
  },
  selectText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  checkMark: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  chevronPressed: {
    borderColor: "#f97316",
  },
});