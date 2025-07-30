import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Phase3() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.blueCircle} />

      {/* Header */}
      <Text style={styles.header}>Verifying{"\n"}Consumer!</Text>

      {/* Blurred Container */}
      <View style={styles.contentWrapper}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          {/* Sub-header */}
          <Text style={styles.subHeader}>Verifying Information{"\n"}by the Admin.</Text>

          {/* Video Logo */}
          <View style={styles.gifWrapper}>
            <Video
              source={require("../../assets/images/drop.mp4")}
              rate={1.0}
              isMuted={true}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              style={styles.gifVideo}
            />
          </View>

          {/* Message */}
          <Text style={styles.message}>
            Your account is currently being reviewed by our admin team. The
            approval process may take up to an hour. Please feel free to check
            back later. Thank you for your patience!
          </Text>

          {/* Back to Login Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Visit Us Section */}
      <View style={styles.visitSection}>
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.visitText}>Visit us</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons
            name="logo-facebook"
            size={24}
            color="#1877F2"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.fbText}>Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
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
    top: height * 0.10,
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "flex-start",
    width: "100%",
    alignItems: "center",
    marginTop: 225,
  },
  blurContainer: {
    width: "90%",
    borderRadius: 25,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: "center",
    backgroundColor: "rgba(90, 79, 79, 0.25)",
    overflow: "hidden",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#073b5c",
    textAlign: "center",
    marginBottom: 20,
  },
  gifWrapper: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  gifVideo: {
    width: 80,
    height: 80,
  },
  message: {
    color: "#555",
    fontStyle: "italic",
    textAlign: "center",
    fontSize: 14,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#00a8e8",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
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
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#aaa",
  },
  visitText: {
    marginHorizontal: 10,
    color: "#555",
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
});
