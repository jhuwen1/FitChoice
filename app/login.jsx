import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { createUserIfNotExists } from "../authHelpers";
import { auth } from "../firebaseConfig";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    let newErrors = {};

    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      try {
        await createUserIfNotExists(userCred.user.uid, email.trim());
      } catch (dbError) {
        console.log("Database Helper Error:", dbError);
      }

      setLoading(false);
      router.replace("/dashboard");
    } catch (error) {
      setLoading(false);
      console.log("Full Login Error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setErrors({ email: "Invalid email or password" });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "Invalid email format" });
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert("Locked", "Too many failed attempts. Try again later.");
      } else {
        Alert.alert("Login Error", error.message || "Something went wrong.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        Fit<Text style={{ color: "#f97316" }}>Choice</Text>
      </Text>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>❮   Back</Text>
      </Pressable>

      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Glad to see you again.</Text>

      <View style={styles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#aaa" />
        <TextInput
          placeholder="sample@gmail.com"
          placeholderTextColor="#aaa"
          style={styles.inputField}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#aaa" />
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          style={styles.inputField}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#aaa"
          />
        </Pressable>
      </View>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <View style={styles.rowBetween}>
        <Pressable
          style={styles.rememberRow}
          onPress={() => setRemember(!remember)}
        >
          <View style={styles.circle}>
            {remember && <View style={styles.innerDot} />}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            Alert.alert("Forgot Password", "Reset flow coming soon!")
          }
        >
          <Text style={styles.forgot}>Forgot Password?</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      <Text style={styles.terms}>
        By logging in, you agree to our{" "}
        <Text style={styles.link}>Terms & Conditions</Text> and{" "}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>

      <Text style={styles.or}>Or Sign in with</Text>

      <View style={styles.socialRow}>
        <Pressable style={styles.socialBtn}>
          <FontAwesome name="facebook" size={20} color="#1877f2" />
        </Pressable>

        <Pressable style={styles.socialBtn}>
          <FontAwesome name="google" size={20} color="#db4437" />
        </Pressable>

        <Pressable style={styles.socialBtn}>
          <MaterialCommunityIcons name="microsoft" size={20} color="#f25022" />
        </Pressable>
      </View>

      <Text style={styles.footer}>
        Don’t have an account?{" "}
        <Text style={styles.link} onPress={() => router.push("/signup")}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  logo: {
    fontSize: 35,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  back: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    marginBottom: 10,
    fontWeight: "600",
    marginTop: 10,
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 20,
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputField: {
    flex: 1,
    color: "#fff",
    paddingVertical: 15,
    marginLeft: 10,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 8,
    marginTop: -5,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    color: "#aaa",
    marginLeft: 8,
    fontSize: 12,
  },
  forgot: {
    color: "#f97316",
    fontSize: 12,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
  },
  innerDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#22c55e",
  },
  button: {
    backgroundColor: "#f97316",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  terms: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
  link: {
    color: "#22c55e",
  },
  or: {
    color: "#aaa",
    textAlign: "center",
    marginVertical: 20,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  socialBtn: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 50,
    width: 60,
    alignItems: "center",
  },
  footer: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});
