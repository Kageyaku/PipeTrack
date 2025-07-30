import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";

import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Header() {
  const router = useRouter();
  const [notifVisible, setNotifVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const notifSlideAnim = useRef(new Animated.Value(-200)).current;

  const closeNotifDropdown = () => {
    Animated.timing(notifSlideAnim, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setNotifVisible(false));
  };

  const toggleNotifDropdown = () => {
    if (notifVisible) {
      closeNotifDropdown();
    } else {
      setNotifVisible(true);
      Animated.timing(notifSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleMenuDropdown = () => {
    setMenuVisible(!menuVisible);
  };


const handleLogout = () => {
  setMenuVisible(false);
  Alert.alert(
    "Logout Confirmation",
    "Are you sure you want to log out?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => router.replace("/"), // Navigate to index.tsx
      },
    ],
    { cancelable: true }
  );
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrapper}
    >
      <View style={styles.container}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <Image
            source={require("../../assets/images/images.jpg")}
            style={styles.logoImage}
          />
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoText}>LIWAD</Text>
            <Text style={styles.logoTextdown}>Lian Water District</Text>
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={toggleNotifDropdown} style={styles.iconWrapper}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMenuDropdown} style={styles.iconWrapper}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Dropdown */}
      {notifVisible && (
        <TouchableWithoutFeedback onPress={closeNotifDropdown}>
          <View style={styles.overlay}>
            <Animated.View
              style={[styles.messageBox, { transform: [{ translateY: notifSlideAnim }] }]}
            >
              <Text style={styles.messageText}>
                ✅{" "}
                <Text style={{ fontWeight: "bold" }}>
                  Your account has been successfully verified!
                </Text>{" "}
                You are now recognized as a legitimate customer of PrimeWater
                Nasugbu. You can now fully access our services, report pipe
                issues, and receive updates.
              </Text>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Menu Dropdown */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.menuBox}>
              <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                <Ionicons name="log-out-outline" size={18} color="#073b5c" />
                <Text style={styles.menuText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  container: {
    backgroundColor: "#073b5c",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 7,
    marginLeft: 5,
    resizeMode: "cover",
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  logoTextContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  logoTextdown: {
    fontSize: 10,
    color: "#fff",
    marginTop: -4,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    paddingHorizontal: 8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  messageBox: {
    position: "absolute",
    top: 95,
    left: 100,
    right: 20,
    backgroundColor: "#d9efff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  messageText: {
    fontSize: 13,
    color: "#073b5c",
    lineHeight: 18,
  },
  menuBox: {
    position: "absolute",
    top: 95,
    right: 20,
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    width: 130,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 14,
    color: "#073b5c",
    marginLeft: 8,
  },
});
