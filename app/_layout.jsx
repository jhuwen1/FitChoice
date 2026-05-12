import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {/* login auth pages */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />

        {/* Setup screen pages */}
        <Stack.Screen name="setupscreen" />
        <Stack.Screen name="infoscreen" />

        {/* Main App pages */}
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="macroscanner" />
        <Stack.Screen name="exercisepool" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="add" />
      </Stack>
    </AuthProvider>
  );
}
