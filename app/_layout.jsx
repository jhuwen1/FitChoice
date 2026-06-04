import { Stack } from "expo-router";
import { Image } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";

if (Image && Image.getSize) {
  const originalGetSize = Image.getSize;
  
  Object.defineProperty(Image, "getSize", {
    value: function (uri, success, failure) {
      if (typeof uri !== "string") {
        console.warn("[Polyfill Guard] Blocked non-string source from hitting native layers.");
        if (typeof failure === "function") {
          failure(new Error("Image.getSize: URI must be a string"));
        }
        return;
      }
      return originalGetSize.apply(this, arguments);
    },
    writable: false, 
    configurable: true,
  });
}

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {/* Login & Auth Pages */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />

        {/* Setup Screen Pages */}
        <Stack.Screen name="setupscreen" />
        <Stack.Screen name="infoscreen" />
        <Stack.Screen name="introscreen" />
        <Stack.Screen name="privpol" />
        <Stack.Screen name="tac" />

        {/* Main App Pages */}
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="macroscanner" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="quest" />
        <Stack.Screen name="shop" />

        {/* Workout Split Routes */}
        <Stack.Screen name="chest" />
        <Stack.Screen name="arm" />
        <Stack.Screen name="back" />
      </Stack>
    </AuthProvider>
  );
}