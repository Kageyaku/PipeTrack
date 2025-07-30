import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const { width, height } = Dimensions.get("window");

const barangayData = [
  { label: "Poblacion 1", value: "Poblacion 1" },
  { label: "Poblacion 2", value: "Poblacion 2" },
  { label: "Poblacion 3", value: "Poblacion 3" },
  { label: "Poblacion 4", value: "Poblacion 4" },
  { label: "Poblacion 5", value: "Poblacion 5" },
  { label: "San Diego", value: "San Diego" },
  { label: "Puting Buhangin", value: "Puting Buhangin" },
  { label: "Lumaniag", value: "Lumaniag" },
  { label: "Malaruhatan", value: "Malaruhatan" },
  { label: "Matabungkay", value: "Matabungkay" },
  { label: "Prenza", value: "Prenza" },
];

export default function Phase1() {
  const router = useRouter();

  // Form states
  const [fullname, setFullname] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [sex, setSex] = useState("");
  const [barangay, setBarangay] = useState(null);
  const [street, setStreet] = useState("");

  const city = "Lian"; // Fixed value

const handleNext = () => {
  if (!fullname || !contactNumber || !sex || !barangay || !street) {
    Alert.alert("Incomplete Form", "Please fill in all fields before proceeding.");
    return;
  }

  Alert.alert(
    "Please Double-Check Your Details",
    "You're about to proceed with the information you entered. Kindly make sure everything is correct — especially your full name, contact number, and address — as this will be reviewed by our admin.\n\n⚠️ Incorrect info might delay your account approval.",
    [
      { text: "Review Again", style: "cancel" },
      {
        text: "Yes, Continue",
        onPress: () => {
          router.push({
            pathname: "/signup/phase2",
            params: {
              fullname,
              contact_number: contactNumber,
              sex,
              city,
              barangay,
              street,
            },
          });
        },
      },
    ]
  );
};
const sexOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

  return (
    <View style={styles.container}>
      {/* Blue Background */}
      <View style={styles.blueCircle} />

      {/* Registration Text */}
      <Text style={styles.header}>REGISTRATION!</Text>

      {/* Form Container */}
      <View style={styles.contentWrapper}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          {/* Full Name */}
          <TextInput
            placeholder="Ex. Dela Cruz, Juan C."
            placeholderTextColor="#666"
            style={[styles.input, { fontStyle: "normal" }]}
            value={fullname}
            onChangeText={setFullname}
          />
          <Text style={styles.label}>Full Name</Text>

          {/* Contact Number */}
          <TextInput
            placeholder="Contact Number"
            placeholderTextColor="#666"
            style={[styles.input, { fontStyle: "normal" }]}
            keyboardType="phone-pad"
            value={contactNumber}
            onChangeText={setContactNumber}
          />
          <Text style={styles.label}>Contact Number</Text>

          {/* Gender */}
          <Dropdown
            data={sexOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Sex"
            value={sex}
            onChange={(item) => setSex(item.value)}
            style={styles.dropdownInput}
            containerStyle={styles.dropdownContainer}
            maxHeight={120}
            placeholderStyle={{ color: "#666", fontStyle: "italic" }}
            selectedTextStyle={{ fontStyle: "normal" }}
          />
          <Text style={styles.label}>Gender</Text>

          {/* City */}
          <TextInput
            placeholder="Lian"
            placeholderTextColor="#666"
            editable={false}
            style={[styles.input, { fontStyle: "normal" }]}
            value={city}
          />
          <Text style={styles.label}>City</Text>

          {/* Barangay Dropdown */}
          <Dropdown
            data={barangayData}
            labelField="label"
            valueField="value"
            placeholder="Select Barangay"
            value={barangay}
            onChange={(item) => setBarangay(item.value)}
            style={styles.dropdownInput}
            containerStyle={styles.dropdownContainer}
            maxHeight={200}
            placeholderStyle={{ color: "#666", fontStyle: "italic" }}
            selectedTextStyle={{ fontStyle: "normal" }}
          />
          <Text style={styles.label}>Barangay</Text>

          {/* Street */}
          <TextInput
            placeholder="Street"
            placeholderTextColor="#666"
            style={[styles.input, { fontStyle: "normal" }]}
            value={street}
            onChangeText={setStreet}
          />
          <Text style={styles.label}>Street</Text>

          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>

          {/* Already have account */}
          <Text style={styles.loginText}>
            Already have an Account{" "}
            <Text style={styles.loginLink} onPress={() => router.replace("/")}>
              Login here
            </Text>
          </Text>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    top: height * 0.12,
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
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
  dropdownInput: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    height: 50,
    fontStyle: "normal",
  },
  dropdownContainer: {
    borderRadius: 10,
  },
  nextButton: {
    backgroundColor: "#00a8e8",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 10,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
  },
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
});
