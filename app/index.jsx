import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {

  const auth = useAuth();
  const router = useRouter();

  if (!auth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const { user, loading } = auth;

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/introscreen");
    }
  }, [loading, user, router]); 
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#f97316" />
      <Text style={{ color: "#fff", marginTop: 10 }}>
        Checking authentication...
      </Text>
    </View>
  );
}
