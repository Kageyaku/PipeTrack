import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { WebView } from "react-native-webview";
import { submitReport } from "../../services/api";
import { getData } from "../../utils/storage";
import Header from "../header";


type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function ReportScreen() {
  const [location, setLocation] = useState("");
  const [issueType, setIssueType] = useState("");
  const [details, setDetails] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [issueOptions, setIssueOptions] = useState([
    { label: "Leaking Pipe", value: "leaking_pipe" },
    { label: "No Water Supply", value: "no_water_supply" },
    { label: "Dirty Water", value: "dirty_water" },
    { label: "Burst Pipe", value: "burst_pipe" },
    { label: "Low Pressure", value: "low_pressure" },
    { label: "Others", value: "others" },
  ]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(coords);
    })();
  }, []);

      const handlePinLocation = async () => {
        try {
          if (!region) return;

          const url = `https://nominatim.openstreetmap.org/reverse?lat=${region.latitude}&lon=${region.longitude}&format=json`;

          const response = await fetch(url, {
              headers: {
                "User-Agent": "pipetrack-mobile-app", // or your app name
                "Accept": "application/json"
              }
            });
          const data = await response.json();

          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`${region.latitude}, ${region.longitude}`);
          }

          setModalVisible(false);
        } catch (err) {
          Alert.alert("Error", "Could not get location.");
          console.error("Reverse geocoding error:", err);
        }
      };
    
      
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  
const handleSubmit = async () => {
  if (!issueType || !details || !region || !location) {
    Alert.alert("Missing Fields", "Please fill in all required fields.");
    return;
  }

  try {
    const formData = new FormData();
    const user = await getData("user");
    const userId = user?.user_id;

    if (!userId) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    // Use current timestamp for created_at
    const currentDate = new Date().toISOString();
    
    formData.append("user_id", userId.toString());
    formData.append("report_type", issueType);
    formData.append("status", "pending");
    formData.append("description", details);
    formData.append("address", location);
    formData.append("location_lat", region.latitude.toString());
    formData.append("location_lng", region.longitude.toString());
    formData.append("created_at", currentDate); // Only using created_at now

    if (imageUri) {
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");  
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("image_path", {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }

    await submitReport(formData);

    Alert.alert("Success", "Report submitted successfully. It will be reviewed and approved by the admin.");
    setDetails("");
    setIssueType("");
    setImageUri(null);
    setLocation("");

  } catch (err: unknown) {
    const error = err as Error;
    Alert.alert("Error", error.message || "Failed to submit report.");
    console.error(error);
  }
};

  // ✅ Generate the HTML only when region changes
  const mapHtml = useMemo(() => {
    const lat = region?.latitude || 14.5995;
    const lng = region?.longitude || 120.9842;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          const map = L.map('map').setView([${lat}, ${lng}], 16);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenStreetMap contributors'
          }).addTo(map);

          let marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

          marker.on('dragend', function (e) {
            const pos = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({ lat: pos.lat, lng: pos.lng }));
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
          });
        </script>
      </body>
      </html>
    `;
  }, [region]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header />

      <View style={styles.container}>
        <Text style={styles.title}>Report Issue</Text>

        <Text style={styles.description}>
          Quickly report water issues to help LIWAD respond fast and keep water safe.
        </Text>

        {/* Location Input */}
        <View style={styles.locationInputWrapper}>
          <TextInput
            placeholder="Location *"
            placeholderTextColor="#888"
            style={styles.locationInput}
            value={location}
            onChangeText={setLocation}
          />
          <View style={styles.lineAndIconContainer}>
            <View style={styles.verticalLine} />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="location-sharp" size={24} color="#073b5c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map Modal */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              onMessage={(event) => {
                const data = JSON.parse(event.nativeEvent.data);
                const coords = {
                  latitude: data.lat,
                  longitude: data.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                };
                setRegion(coords);
              }}
              style={{ flex: 1 }}
            />

            <TouchableOpacity style={styles.modalButton} onPress={handlePinLocation}>
              <Text style={styles.modalButtonText}>Pin My Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeModalButton}
            >
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Dropdown */}
        <DropDownPicker
          open={openDropdown}
          setOpen={setOpenDropdown}
          value={issueType}
          setValue={setIssueType}
          items={issueOptions}
          setItems={setIssueOptions}
          placeholder="Type of Issue *"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={1000}
          zIndexInverse={3000}
        />

        {/* Details */}
        <TextInput
          placeholder="Details of Issue *"
          placeholderTextColor="#888"
          style={[styles.textInput, styles.textArea]}
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
        />

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            <Ionicons name="document-attach-outline" size={28} color="#073b5c" />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadBox} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={28} color="#073b5c" />
            <Text style={styles.uploadText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 100, height: 100, borderRadius: 10, alignSelf: "center", marginBottom: 20 }}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Report</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#073b5c",
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    marginBottom: 25,
    textAlign: "justify",
  },
  locationInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 10,
    color: "#333",
    fontSize: 14,
  },
  lineAndIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
  },
  verticalLine: {
    width: 1,
    height: 44,
    backgroundColor: "#aaa",
    marginRight: 10,
  },
  dropdown: {
    borderColor: "#aaa",
    borderRadius: 10,
    marginBottom: 16,
  },
  dropdownContainer: {
    borderColor: "#aaa",
    borderRadius: 10,
  },
  textInput: {
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 15,
    color: "#333",
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    textAlignVertical: "top",
    height: 100,
  },
  modalButton: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "#00a8e8",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeModalButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeModalText: {
    color: "#333",
    fontWeight: "bold",
  },
  uploadSection: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  uploadBox: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 12,
    marginTop: 8,
    color: "#073b5c",
  },
  submitButton: {
    backgroundColor: "#00a8e8",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginHorizontal: 40,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
