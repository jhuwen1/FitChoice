import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function signup() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const animatedWidth = useRef(new Animated.Value(0)).current;

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthText = ["Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["#ef4444", "#facc15", "#22c55e", "#16a34a"];

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: strength / 4,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [strength]);

  const handleSignup = async () => {
    let newErrors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!isValidEmail(email)) newErrors.email = "Invalid email";

    if (!password) newErrors.password = "Password required";
    else if (strength < 3) newErrors.password = "Password is too weak";

    if (password !== confirmPassword)
      newErrors.confirm = "Passwords do not match";

    if (!agreed) newErrors.terms = "You must agree first";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);

      setLoading(false);
      router.replace("/setupscreen");
    } catch (error) {
      setLoading(false);
      console.log("Firebase Error:", error.code);

      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "This email is already taken." });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ email: "That email address is invalid." });
      } else {
        Alert.alert("Signup Failed", "Check your internet or Firebase config.");
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

      <Text style={styles.title}>Create Your Account</Text>

      <TextInput
        placeholder="sample@gmail.com"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <View style={styles.inputWrapper}>
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

      <View style={styles.strengthBar}>
        <Animated.View
          style={[
            styles.strengthFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: strengthColor[strength - 1] || "#333",
            },
          ]}
        />
      </View>

      <Text style={styles.strengthText}>
        Strength: {strengthText[strength - 1] || "Too weak"}
      </Text>

      <Text style={styles.rules}>
        • At least 8 characters{"\n"}• Include uppercase letter{"\n"}• Include
        number{"\n"}• Include symbol (!@#_)
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Confirm your password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          style={styles.inputField}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}

      <Pressable style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
        <View style={styles.circle}>
          {agreed && <View style={styles.innerDot} />}
        </View>
        
        {/* Important: Do NOT put an onPress on this outer Text if possible, 
            as it can conflict with the nested ones in some RN versions */}
        <Text style={styles.terms}>
          I agree to the{" "}
          <Text 
            style={styles.link} 
            onPress={(e) => {
              e.stopPropagation(); // 3. Prevents the checkbox from toggling
              router.push("/tac"); 
            }}
          >
            Terms & Conditions
          </Text>
          {" "}and{" "}
          <Text 
            style={styles.link} 
            onPress={(e) => {
              e.stopPropagation(); 
              router.push("/privpol");
            }}
          >
            Privacy Policy
          </Text>
        </Text>
      </Pressable>
      
      {errors.terms && <Text style={styles.error}>{errors.terms}</Text>}

      <Pressable
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </Pressable>

      <Text style={styles.or}>Or Sign Up with</Text>

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
        Already have an account?{" "}
        <Text style={styles.link} onPress={() => router.push("/login")}>
          Login
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
    marginBottom: 20,
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    padding: 15,
    color: "#fff",
    marginBottom: 10,
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputField: {
    flex: 1,
    color: "#fff",
    paddingVertical: 15,
  },
  strengthBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#333",
    borderRadius: 5,
    marginBottom: 5,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 5,
  },
  strengthText: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 10,
  },
  rules: {
    color: "#777",
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 18,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 8,
    marginTop: -5,
  },
  termsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
  },
  terms: {
    color: "#aaa",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  link: {
    color: "#22c55e",
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
    marginTop: 10,
  },
});
