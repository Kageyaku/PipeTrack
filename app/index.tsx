import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { storeData } from "./utils/storage";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

 const handleForgotPassword = async () => {
  if (!forgotEmail.trim()) {
    Alert.alert("Validation", "Please enter your email.");
    return;
  }

  try {
    const response = await fetch("http://192.168.0.171/liwad-api/forgot_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.trim() }),
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);

      if (data.success) {
        Alert.alert("Success", "Check your email for the reset link.");
        setShowForgotModal(false);
        setForgotEmail("");
      } else {
        Alert.alert("Error", data.message || "Email not found.");
      }
    } catch (parseError) {
      console.error("Parse Error:", text);
      Alert.alert("Error", "Unexpected server response.");
    }
  } catch (error) {
    console.error("Reset error:", error);
    Alert.alert("Error", "Something went wrong.");
  }
};

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Validation", "Please enter both email and password.");
    return;
  }

  try {
    const response = await fetch("http://192.168.0.171/liwad-api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      Alert.alert("Login Failed", data.message || "Invalid credentials.");
      return;
    }

    const status = data.data?.account_status?.toLowerCase();

    if (status === "pending") {
      router.replace("/signup/phase3");
    } else if (status === "rejected") {
      Alert.alert("Account Rejected", "This account has been rejected.");
    } else if (status === "approved") {
      await storeData("user", {
        user_id: data.data.user_id,
        fullname: data.data.fullname,
        contact_number: data.data.contact_number,
        sex: data.data.sex,
        street: data.data.street,
        barangay: data.data.barangay,
        city: data.data.city,
        email: data.data.email,
        account_status: data.data.account_status,
        profile: data.data.profile || "", // 🔥 ito ang kulang
      });

      console.log("Logged-in user data:", data.data);
      Alert.alert("Login Successful", `Welcome ${data.data.fullname}`);
      router.replace("/mainpage");
    } else {
      Alert.alert("Error", "Unknown account status.");
    }
  } catch (error) {
    console.error("Login error:", error);
    Alert.alert("Error", "Something went wrong while logging in.");
  }
};

  const handleSignUp = () => router.push("/signup/phase1");

  const handleOpenFacebook = () => {
    Linking.openURL("https://www.facebook.com/lianwaterdistrict").catch(() =>
      Alert.alert("Error", "Failed to open the link.")
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.blueCircle} />
      <Text style={styles.welcomeText}>WELCOME!</Text>

      <View style={styles.contentWrapper}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <Image
            source={require("../assets/images/pipetrack-logo.png")}
            style={styles.logo}
          />

          <TextInput
            placeholder="Enter Email"
            placeholderTextColor="#666"
            style={[styles.input, { fontStyle: "normal" }]}
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Email</Text>

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Enter Password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              style={[styles.passwordInput, { fontStyle: "normal" }]}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordLabelRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => setShowForgotModal(true)}>
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            Doesn't have an Account yet?{" "}
            <Text style={styles.signupLink} onPress={handleSignUp}>
              Sign Up
            </Text>
          </Text>

          <Text style={styles.termsText}>
            By logging in, you agree to our{" "}
            <Text style={styles.linkText} onPress={() => setShowTermsModal(true)}>
              Terms and Conditions
            </Text>
            .
          </Text>
        </BlurView>
      </View>

      <View style={styles.visitSection}>
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.visitText}>Visit us</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.fbButton} onPress={handleOpenFacebook}>
          <Ionicons name="logo-facebook" size={24} color="#1877F2" style={{ marginRight: 8 }} />
          <Text style={styles.fbText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Terms Modal */}
      <Modal visible={showTermsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <Text style={styles.modalText}>
                Welcome to PipeTrack. By using our application, you agree to comply with and be
                bound by the following terms and conditions of use, which together with our privacy
                policy govern PipeTrack's relationship with you.
              </Text>
              <Text style={styles.modalText}>
                1. You must provide accurate account information at all times.
                {"\n"}2. You agree not to misuse the services provided.
                {"\n"}3. All data and reports submitted are subject to verification.
                {"\n"}4. PipeTrack is not liable for delays caused by third-party providers.
              </Text>
              <Text style={styles.modalText}>
                For more information, please contact support@pipetrack.com.
              </Text>

              <TouchableOpacity
                style={styles.agreeButton}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.agreeButtonText}>Agree</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal visible={showForgotModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.agreeButton, isSending && { backgroundColor: "#ccc" }]}
              onPress={handleForgotPassword}
              disabled={isSending}
            >
              <Text style={styles.agreeButtonText}>
                {isSending ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowForgotModal(false)}
              style={{ marginTop: 10, alignSelf: "center" }}
            >
              <Text style={{ color: "#00a8e8" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", alignItems: "center" },
  blueCircle: {
    position: "absolute",
    top: -height * 0.36,
    width: width * 2,
    height: width * 2,
    backgroundColor: "#073b5c",
    borderRadius: width,
  },
  welcomeText: {
    position: "absolute",
    top: height * 0.15,
    fontSize: 50,
    fontWeight: "bold",
    color: "white",
    marginTop: -29,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    marginBottom: 50,
  },
  blurContainer: {
    width: "90%",
    borderRadius: 25,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: "center",
    backgroundColor: "rgba(90, 79, 79, 0.25)",
    overflow: "hidden",
    marginTop: 60,
  },
  logo: {
    width: 180,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
    transform: [{ scale: 3 }],
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.67)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    fontStyle: "italic",
  },
  label: {
    alignSelf: "flex-start",
    color: "black",
    marginBottom: 10,
    marginLeft: 4,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    width: "100%",
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontStyle: "italic",
  },
  loginButton: {
    backgroundColor: "#00a8e8",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 10,
  },
  loginButtonText: { color: "white", fontWeight: "bold" },
  signupText: { marginTop: 20, marginBottom: 5, color: "#333" },
  signupLink: {
    color: "#00a8e8",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
    marginHorizontal: 10,
  },
  linkText: {
    color: "#00a8e8",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  visitSection: {
    marginBottom: 40,
    width: "85%",
    alignItems: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  line: { flex: 1, height: 1, backgroundColor: "#aaa" },
  visitText: { marginHorizontal: 10, color: "#555" },
  fbButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  fbText: { color: "#1877F2", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#073b5c",
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  agreeButton: {
    backgroundColor: "#00a8e8",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  agreeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
      forgotPasswordText: {
      color: "#00a8e8",
      fontWeight: "bold",
      marginTop: 8,
      marginBottom: 12,
      textDecorationLine: "underline",
      alignSelf: "flex-end",
    },

    passwordLabelRow: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 10,
  paddingHorizontal: 4,
  marginTop: -2,
},
forgotPasswordLink: {
  color: "#00a8e8",
  fontWeight: "bold",
  textDecorationLine: "underline",
  fontSize: 13,
},


});
