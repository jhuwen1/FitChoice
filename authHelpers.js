import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { Pressable, Text } from "react-native";
import { uploadFoodScan } from "./services/foodScanner";

export default function MacrosScanner({ navigation }) {
  const [perm, request] = useCameraPermissions();

  if (!perm?.granted)
    return (
      <Pressable onPress={request} style={styles.center}>
        <Text style={{ color: "#fff" }}>Grant Camera Access</Text>
      </Pressable>
    );

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      onCapture={async (photo) => {
        const processed = await ImageManipulator.manipulateAsync(photo.uri, [
          { resize: { width: 720 } },
        ]);

        await uploadFoodScan(processed.uri);
        navigation.goBack();
      }}
    >
      <Pressable style={styles.close} onPress={() => navigation.goBack()}>
        <Text style={{ color: "#fff" }}>X</Text>
      </Pressable>

      <Text style={styles.scanText}>Point camera at food or barcode...</Text>
    </CameraView>
  );
}
