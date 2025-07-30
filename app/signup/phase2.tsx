import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ required to complete the Google auth session
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get("window");

export default function Phase2() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

const redirectUri = AuthSession.makeRedirectUri(); // ✅ WALANG useProxy
console.log("Redirect URI:", redirectUri);

const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: "438041549314-17v0vkts790l5mcf3m12d4kfl4d4svsr.apps.googleusercontent.com",
  scopes: ["profile", "email", "openid"],
  redirectUri,
});
 
  useEffect(() => {
    if (response?.type === "success" && response.authentication) {
      const { authentication } = response;

      fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
        .then(res => res.json())
        .then(async (data) => {
          setEmail(data.email);
          try {
            const registerResponse = await fetch("http://192.168.0.171/liwad-api/register.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fullname: data.name,
                contact_number: "N/A",
                sex: "Prefer not to say",
                city: "N/A",
                barangay: "N/A",
                street: "N/A",
                email: data.email,
                password: "google_oauth",
              }),
            });

            const result = await registerResponse.json();
            if (result.success) {
              Alert.alert("Success", "Registered with Google successfully!");
              router.push("/signup/phase3");
            } else {
              Alert.alert("Google Sign-In", "Email already registered or failed.");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to register with Google");
            console.error(error);
          }
        })
        .catch(() => {
          Alert.alert("Error", "Failed to fetch Google account details.");
        });
    }
  }, [response]);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Incomplete", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    if (!agreed) {
      Alert.alert("Terms Required", "Please agree to the Terms and Conditions to proceed.");
      return;
    }

    try {
      const response = await fetch("http://192.168.0.171/liwad-api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: params.fullname,
          contact_number: params.contact_number,
          sex: params.sex,
          city: params.city,
          barangay: params.barangay,
          street: params.street,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push("/signup/phase3");
      } else {
        Alert.alert("Registration Failed", result.message || "Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Check your connection.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.blueCircle} />
      <Text style={styles.header}>Create Account!</Text>

      <View style={styles.contentWrapper}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <Image
            source={require("../../assets/images/pipetrack-logo.png")}
            style={styles.logo}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#666"
            style={[styles.input, { fontStyle: "normal" }]}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Email</Text>

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              style={[styles.passwordInput, { fontStyle: "normal" }]}
              value={password}
              onChangeText={setPassword}
            />
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#888"
              onPress={() => setShowPassword(!showPassword)}
            />
          </View>
          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              secureTextEntry={!showConfirmPassword}
              style={[styles.passwordInput, { fontStyle: "normal" }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Ionicons
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={20}
              color="#888"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>
          <Text style={styles.label}>Confirm Password</Text>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
            onPress={() => setAgreed(!agreed)}
          >
            <Ionicons
              name={agreed ? "checkbox" : "square-outline"}
              size={20}
              color="#073b5c"
              style={{ marginRight: 8 }}
            />
            <Text style={{ fontSize: 12, color: "#333" }}>
              I have read and agree to the{" "}
              <Text
                style={{ color: "#00a8e8", textDecorationLine: "underline" }}
                onPress={() => setShowTermsModal(true)}
              >
                Terms and Conditions
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          {/* 👉 Google Sign-In */}
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 20,
              marginTop: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => promptAsync()}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 8 }} />
            <Text style={{ color: "#333", fontWeight: "bold" }}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.loginText}>
            Already have an Account{" "}
            <Text style={styles.loginLink} onPress={() => router.replace("/")}>
              Login here
            </Text>
          </Text>
        </BlurView>
      </View>

      <Modal visible={showTermsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <Text style={styles.modalText}>
                Welcome to PipeTrack. By creating an account, you agree to the following:
              </Text>
              <Text style={styles.modalText}>
                1. Provide accurate and truthful information.{"\n"}
                2. Do not misuse our services.{"\n"}
                3. Reports may be subject to validation.{"\n"}
                4. PipeTrack shall not be held liable for third-party delays or issues.
              </Text>
              <Text style={styles.modalText}>
                Please read the full policy at pipetrack.com/policy or contact support for more details.
              </Text>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
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
  header: {
    position: "absolute",
    top: height * 0.1,
    fontSize: 50,
    fontWeight: "bold",
    color: "white",
  },
contentWrapper: {
  flex: 1,
  justifyContent: "center", // center instead of flex-end
  width: "100%",
  alignItems: "center",
  paddingTop: 20, // optional to fine-tune spacing
  paddingBottom: 20, // avoid crowding at the bottom
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
    width: 150,
    height: 90,
    resizeMode: "contain",
    marginBottom: 20,
    transform: [{ scale: 3 }],
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
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
  registerButton: {
    backgroundColor: "#00a8e8",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 10,
  },
  registerButtonText: { color: "white", fontWeight: "bold" },
  loginText: {
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  loginLink: {
    color: "#00a8e8",
    fontWeight: "bold",
    textDecorationLine: "underline",
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
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  fbText: {
    fontWeight: "bold",
    color: "#444",
  },

  // Modal Styles
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
  closeModalButton: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#073b5c",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  closeModalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
