import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";

export default function SetupScreen() {
  const router = useRouter();

  const { user } = useAuth();

  const [index, setIndex] = useState(0);
  const [gender, setGender] = useState("male");

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [showHints, setShowHints] = useState(true);

  const sceneRef = useRef();
  const modelRef = useRef();

  const modelsMap = useRef({});

  const velocity = useRef(0);
  const rotation = useRef(0);

  const scale = useRef(1);
  const lastDistance = useRef(0);

  const isTouching = useRef(false);

  const models = {
    male: [
      { title: "Lean", file: require("../assets/models/male1.glb") },
      { title: "Athletic", file: require("../assets/models/male2.glb") },
      { title: "Heavy", file: require("../assets/models/male3.glb") },
    ],
  };

  const currentModels = models[gender];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: () => {
      isTouching.current = true;
      lastDistance.current = 0;
      setShowHints(false);
    },

    onPanResponderMove: (evt, gesture) => {
      const touches = evt.nativeEvent.touches;

      if (touches.length === 1) {
        velocity.current = gesture.dx * 0.002;
      }

      if (touches.length === 2) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (lastDistance.current) {
          let diff = distance - lastDistance.current;

          scale.current += diff * 0.005;
          scale.current = Math.max(0.5, Math.min(3, scale.current));

          if (modelRef.current) {
            modelRef.current.scale.set(
              1.5 * scale.current,
              1.5 * scale.current,
              1.5 * scale.current,
            );
          }
        }

        lastDistance.current = distance;
      }
    },

    onPanResponderRelease: () => {
      isTouching.current = false;
      lastDistance.current = 0;
    },
  });

  const loadAllModels = async (scene) => {
    for (let i = 0; i < currentModels.length; i++) {
      const asset = Asset.fromModule(currentModels[i].file);
      await asset.downloadAsync();

      const loader = new GLTFLoader();

      const model = await new Promise((resolve, reject) => {
        loader.load(asset.uri, resolve, undefined, reject);
      }).then((gltf) => gltf.scene);

      model.position.set(0, -1, 0);
      model.scale.set(1.5, 1.5, 1.5);

      model.visible = i === index;

      scene.add(model);

      modelsMap.current[i] = model;
    }

    modelRef.current = modelsMap.current[index];
  };

  const onContextCreate = async (gl) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f172a");

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000,
    );
    camera.position.z = 4;

    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(2, 5, 5);
    scene.add(light);

    await loadAllModels(scene);

    const animate = () => {
      requestAnimationFrame(animate);

      if (modelRef.current) {
        if (isTouching.current) {
          rotation.current += velocity.current;
          velocity.current *= 0.95;
        } else {
          rotation.current += 0.003;
        }

        modelRef.current.rotation.y = rotation.current;
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();

    sceneRef.current = scene;
  };

  useEffect(() => {
    if (!sceneRef.current) return;

    if (modelRef.current) {
      modelRef.current.visible = false;
    }

    const nextModel = modelsMap.current[index];

    if (nextModel) {
      nextModel.visible = true;
      modelRef.current = nextModel;
    }
  }, [index, gender]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {gender.toUpperCase()} - {currentModels[index].title}
      </Text>

      <View style={styles.genderRow}>
        <Pressable
          style={[styles.genderBtn, gender === "male" && styles.activeBtn]}
          onPress={() => setGender("male")}
        >
          <Text style={styles.genderText}>Male</Text>
        </Pressable>

        <Pressable
          style={[styles.genderBtn, gender === "female" && styles.activeBtn]}
          onPress={() => setGender("female")}
        >
          <Text style={styles.genderText}>Female</Text>
        </Pressable>
      </View>

      <View style={styles.viewer} {...panResponder.panHandlers}>
        <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />

        {showHints && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Drag to rotate</Text>
            <Text style={styles.hintText}>Pinch to zoom</Text>
          </View>
        )}
      </View>

      <View style={styles.navContainer}>
        <Pressable
          onPress={() =>
            setIndex(
              (prev) =>
                (prev - 1 + currentModels.length) % currentModels.length,
            )
          }
        >
          {({ pressed }) => (
            <View style={styles.chevronBtn}>
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
            loading && styles.selectBtnLoading,
            selected && styles.selectBtnSuccess,
          ]}
          onPress={async () => {
            if (loading || selected) return;

            if (!user) {
              console.log("No user logged in");
              return;
            }

            setLoading(true);

            try {
              await setDoc(
                doc(db, "users", user.uid),
                {
                  goal: currentModels[index].title.toLowerCase(), 
                  gender: gender,
                },
                { merge: true }
              );

              setLoading(false);
              setSelected(true);

              setTimeout(() => {
                router.push("/infoscreen");
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
          onPress={() => setIndex((prev) => (prev + 1) % currentModels.length)}
        >
          {({ pressed }) => (
            <View style={styles.chevronBtn}>
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
  },

  genderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    backgroundColor: "#1e293b",
    borderRadius: 20,
  },

  activeBtn: {
    backgroundColor: "#f97316",
  },

  genderText: {
    color: "#fff",
    fontWeight: "600",
  },

  viewer: {
    width: "100%",
    height: 400,
  },

  hintContainer: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  hintText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },

  navContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  chevronBtn: {
    color: "#fff",
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },

  chevron: {
    width: 30,
    height: 30,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderColor: "#fff",
  },

  leftChevron: {
    color: "#fff",
    transform: [{ rotate: "-135deg" }],
  },

  rightChevron: {
    color: "#fff",
    transform: [{ rotate: "45deg" }],
  },

  selectBtn: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },

  selectBtnLoading: {
    backgroundColor: "#fb923c",
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
