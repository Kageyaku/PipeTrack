import { Ionicons } from "@expo/vector-icons";
import { format, isValid, parse } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { WebView } from 'react-native-webview';
import { getData } from "../../utils/storage";
import Header from "../header";

const barangayList = [
  "Poblacion 1", "Poblacion 2", "Poblacion 3", "Poblacion 4", "Poblacion 5",
  "San Diego", "Puting Buhangin", "Lumaniag", "Malaruhatan", "Matabungkay", "Prenza"
];

const REFRESH_INTERVAL = 300; // 30 seconds

interface Issue {
  report_id: string;
  user_id: string;
  ticketNo: string;
  type: string;
  date: string;
  reportedBy: string;
  address: string;
  status: string;
  description: string;
  location_lat: string;
  location_lng: string;
  image_path?: string;
  is_archived?: boolean; // Add this line
}

export default function ProfileScreen() {
  /* ------------------------------ STATE ---------------------------- */
  const [profile, setProfile] = useState({
    fullname: "",
    contact_number: "",
    sex: "",
    street: "",
    barangay: "",
    city: "",
    email: "",
    profile: "",
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [reportedIssues, setReportedIssues] = useState<Issue[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [passwords, setPasswords] = useState({ newPw: "", confirmPw: "" });
  const [pwError, setPwError] = useState("");

  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [editFields, setEditFields] = useState({ ...profile });

  const [showImageModal, setShowImageModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);

  const formatDisplayDate = (dateString: string) => {
    try {
      const parsedDate = parse(dateString, "yyyy-MM-dd HH:mm:ss", new Date());
      return isValid(parsedDate) 
        ? format(parsedDate, "MMMM d, yyyy") 
        : "N/A";
    } catch {
      return "N/A";
    }
  };

  /* ----------------------------- LOAD DATA -------------------------- */
const loadReports = async () => {
  const rawUser = await getData("user");
  const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

  try {
    const response = await fetch("http://192.168.0.171/liwad-api/reports/get_user_reports.php", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"  // Explicitly ask for JSON response
      },
      body: JSON.stringify({ user_id: user.user_id }),
    });

    const text = await response.text();
    
    // Check if response looks like HTML (error page)
    if (text.trim().startsWith("<")) {
      throw new Error("Server returned HTML instead of JSON");
    }

    const data = JSON.parse(text);
    
    if (!data.success) {
      throw new Error(data.message || "Failed to load reports");
    }

    setReportedIssues(data.data);
  } catch (error) {
    console.error("Fetch error:", error);
    Alert.alert("Error", "Failed to load reports. Please try again later.");
    // Optional: Set empty array to clear previous data
    setReportedIssues([]);
  }
};
  useEffect(() => {
    const loadUserData = async () => {
      const rawUser = await getData("user");
      let user = null;
      try {
        user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
      } catch {
        user = rawUser;
      }

      if (user) {
        setProfile({
          fullname: user.fullname || "",
          contact_number: user.contact_number || "",
          sex: user.sex || "",
          street: user.street || "",
          barangay: user.barangay || "",
          city: user.city || "",
          email: user.email || "",
          profile: user.profile || "",
        });
      }
    };

    loadUserData();
    loadReports(); // Initial load

    // Set up auto-refresh
    const intervalId = setInterval(loadReports, REFRESH_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  /* ----------------------------- FUNCTIONS -------------------------- */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to allow access to your media library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = result.assets[0].base64;
      setAvatarUri(result.assets[0].uri);

      const rawUser = await getData("user");
      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

      if (!user || !user.user_id) {
        Alert.alert("Error", "Missing user ID. Cannot upload.");
        return;
      }

      try {
        const response = await fetch(
          "http://192.168.0.171/liwad-api/upload_avatar.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.user_id,
              image: base64Img,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          Alert.alert("Success", "Profile picture updated.");
        } else {
          Alert.alert("Upload Failed", data.message || "Unknown error");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to upload image.");
      }
    }
  }; 

const handleDeleteIssue = (report_id: string | number) => {
  Alert.alert(
    "Archive Confirmation",
    "Are you sure you want to archive this report?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Attempting to archive report:", report_id);
            const response = await fetch("http://192.168.0.171/liwad-api/reports/archive_report.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ report_id }),
            });
            
            const responseText = await response.text();
            console.log("Server response:", responseText);
            
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (e) {
              console.error("Failed to parse response:", e);
              throw new Error("Invalid server response");
            }

            if (data.success) {
              console.log("Archive successful, removing from UI");
              setReportedIssues((prev) => prev.filter((i) => i.report_id !== report_id));
              Alert.alert("Success", "Report has been archived.");
            } else {
              console.error("Archive failed:", data.message);
              Alert.alert("Error", data.message || "Failed to archive report.");
            }
          } catch (error: unknown) {
            console.error("Archive error:", error);
            let errorMessage = "Network issue occurred.";
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            Alert.alert("Error", errorMessage);
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  const handleChangePassword = async () => {
    if (!passwords.newPw || !passwords.confirmPw) {
      setPwError("Please fill out both fields.");
      return;
    }

    if (passwords.newPw !== passwords.confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }

    try {
      const rawUser = await getData("user");
      const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

      const response = await fetch("http://192.168.0.171/liwad-api/change_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          new_password: passwords.newPw,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Your password has been changed.");
        setPasswords({ newPw: "", confirmPw: "" });
        setPwError("");
        setShowPasswordModal(false);
      } else {
        setPwError(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPwError("Something went wrong.");
    }
  };

  const handleSaveProfile = () => {
    Alert.alert(
      "Confirm Changes",
      "Are you sure you want to save the changes to your profile?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const rawUser = await getData("user");
              const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

              const response = await fetch("http://192.168.0.171/liwad-api/update_profile.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_id: user.user_id,
                  fullname: editFields.fullname,
                  contact_number: editFields.contact_number,
                  sex: editFields.sex,
                  barangay: editFields.barangay,
                  street: editFields.street,
                }),
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert("Success", "Your profile has been updated.");
                setProfile(editFields);
                setShowEditModal(false);
              } else {
                Alert.alert("Error", data.message || "Failed to update profile.");
              }
            } catch (error) {
              console.error("Update error:", error);
              Alert.alert("Error", "Something went wrong.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  /* ------------------------- FILTER ISSUES -------------------------- */
const filtered = reportedIssues.filter((i) => {
  const allowed = ["resolved", "rejected"];
  const status = i.status.toLowerCase().trim();

  // Skip if archived (check with nullish coalescing in case undefined)
  if (i.is_archived ?? false) return false;
  if (!allowed.includes(status)) return false;
  if (filterStatus === "All") return true;

  return status === filterStatus.toLowerCase();
});
  /* ----------------------------- UI ---------------------------------- */
  return (
    <View style={styles.screen}>
      <Header />

      <View style={styles.container}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          {/* Avatar + camera icon */}
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity onPress={() => setShowImageModal(true)}>
              {avatarUri ? (
                <Image style={styles.avatar} source={{ uri: avatarUri }} />
              ) : profile.profile ? (
                <Image
                  style={styles.avatar}
                  source={{
                    uri: `http://192.168.0.171/liwad-api/${profile.profile}`,
                  }}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={60} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* User details */}
          <View style={styles.userDetails}>
            <Text style={styles.info}>
              <Text style={styles.bold}>Name:</Text> {profile.fullname}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.bold}>Contact:</Text> {profile.contact_number}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.bold}>Gender:</Text> {profile.sex}
            </Text>
          </View>
        </View>

        {/* EXTRA INFO BUTTONS */}
        <View style={styles.extraInfo}>
          <Text style={styles.info}>
            <Text style={styles.bold}>Address:</Text>{" "}
            {`${profile.street}, ${profile.barangay}, ${profile.city}`}
          </Text>
          <Text style={styles.info}>
            <Text style={styles.bold}>Email:</Text> {profile.email}
          </Text>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => {
              setEditFields({ ...profile });
              setShowEditModal(true);
            }}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* HISTORY REPORT */}
        <View style={styles.reportedCard}>
          <View style={styles.reportedHeader}>
            <Text style={styles.reportedTitle}>History Report</Text>
          </View>

          {/* Filter buttons */}
          <View style={styles.filterButtons}>
            {["All", "Resolved", "Rejected"].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setFilterStatus(s)}
                style={[
                  styles.filterBtn,
                  filterStatus === s && styles.filterBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    filterStatus === s && styles.filterBtnTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Issue list */}
          <ScrollView style={{ maxHeight: 300 }}>
            {filtered.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#666" }}>
                No reports found for selected filter.
              </Text>
            ) : (
              filtered.map((item) => (
                <TouchableOpacity
                  key={item.report_id}
                  style={styles.issueItem}
                  onPress={() => {
                    setSelectedIssue(item);
                    setShowIssueModal(true);
                  }}
                >
                  <View style={styles.issueContent}>
                    <Text style={styles.issueId}>Ticket No: {item.ticketNo}</Text>
                    <Text style={styles.issueInfo}>
                      <Text style={styles.bold}>Type:</Text> {item.type}
                    </Text>
                    <Text style={styles.issueInfo}>
                      <Text style={styles.bold}>Date:</Text> {formatDisplayDate(item.date)}
                    </Text>
                    <Text style={styles.issueInfo}>
                      <Text style={styles.bold}>Status:</Text>{" "}
                      <Text
                        style={{
                          color:
                            item.status.toLowerCase() === "resolved"
                              ? "green"
                              : item.status.toLowerCase() === "rejected"
                                ? "#d00"
                                : "#f39c12",
                        }}
                      >
                        {item.status}
                      </Text>
                    </Text>
                  </View>

                    {(item.status.toLowerCase() === "resolved" || item.status.toLowerCase() === "rejected") && (
                      <Ionicons
                        name="trash"
                        size={20}
                        color="#d00"
                        onPress={() => handleDeleteIssue(item.report_id)}
                      />
                    )}
                </TouchableOpacity>
              ))
            )} 
          </ScrollView>
        </View>
      </View>

      {/* MODALS */}

      {/* Avatar preview modal */}
      <Modal visible={showImageModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowImageModal(false)}
        >
          {avatarUri || profile.profile ? (
            <Image
              source={{
                uri:
                  avatarUri ||
                  `http://192.168.0.171/liwad-api/${profile.profile}`,
              }}
              style={styles.zoomedAvatar}
            />
          ) : (
            <View style={styles.zoomedIconContainer}>
              <Ionicons name="person" size={160} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </Modal>

      {/* Edit profile modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="Full Name"
                style={styles.input}
                value={editFields.fullname}
                onChangeText={(v) => setEditFields((e) => ({ ...e, fullname: v }))}
              />

              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                placeholder="09XXXXXXXXX"
                style={styles.input}
                keyboardType="phone-pad"
                value={editFields.contact_number}
                onChangeText={(v) => setEditFields((e) => ({ ...e, contact_number: v }))}
              />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.dropdownWrapper}>
                <Dropdown
                  data={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                  ]}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Gender"
                  value={editFields.sex}
                  onChange={(item) =>
                    setEditFields((e) => ({ ...e, sex: item.value }))
                  }
                  style={styles.dropdownInput}
                  containerStyle={styles.dropdownContainer}
                  maxHeight={120}
                  placeholderStyle={{ color: "#666", fontStyle: "italic" }}
                  selectedTextStyle={{ fontStyle: "normal" }}
                />
              </View>

              <Text style={styles.label}>Barangay</Text>
              <View style={styles.dropdownWrapper}>
                <Dropdown
                  data={barangayList.map((b) => ({ label: b, value: b }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Barangay"
                  value={editFields.barangay}
                  onChange={(item) =>
                    setEditFields((e) => ({ ...e, barangay: item.value }))
                  }
                  style={styles.dropdownInput}
                  containerStyle={styles.dropdownContainer}
                  maxHeight={200}
                  placeholderStyle={{ color: "#666", fontStyle: "italic" }}
                  selectedTextStyle={{ fontStyle: "normal" }}
                />
              </View>

              <Text style={styles.label}>Street</Text>
              <TextInput
                placeholder="Street"
                style={styles.input}
                value={editFields.street}
                onChangeText={(v) => setEditFields((e) => ({ ...e, street: v }))}
              />

              <Text style={styles.label}>City</Text>
              <TextInput
                editable={false}
                style={[styles.input, { backgroundColor: "#eee" }]}
                value="Lian"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                editable={false}
                style={[styles.input, { backgroundColor: "#eee", color: "#555" }]}
                value={editFields.email}
              />

              <View style={styles.editActionsRow}>
                <TouchableOpacity
                  style={styles.changePwBtn}
                  onPress={() => {
                    setShowEditModal(false);
                    setShowPasswordModal(true);
                  }}
                >
                  <Text style={styles.changePwBtnText}>Change Password</Text>
                </TouchableOpacity>

                <View style={styles.actionButtonsRight}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              secureTextEntry
              placeholder="New Password"
              style={styles.input}
              value={passwords.newPw}
              onChangeText={(text) =>
                setPasswords((p) => ({ ...p, newPw: text }))
              }
            />
            <TextInput
              secureTextEntry
              placeholder="Confirm Password"
              style={styles.input}
              value={passwords.confirmPw}
              onChangeText={(text) =>
                setPasswords((p) => ({ ...p, confirmPw: text }))
              }
            />
            {pwError ? <Text style={styles.error}>{pwError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPwError("");
                  setPasswords({ newPw: "", confirmPw: "" });
                }}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Issue Details Modal */}
      <Modal visible={showIssueModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => {
                setShowIssueModal(false);
                setShowMap(false);
              }}>
                <Ionicons name="close" size={24} color="#073b5c" />
              </TouchableOpacity>
            </View>
            
            {selectedIssue && (
              <>
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Ticket No: </Text>{selectedIssue.ticketNo}
                </Text>
                
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Type: </Text>{selectedIssue.type}
                </Text>

                {selectedIssue?.date ? (() => {
                  const parsedDate = parse(selectedIssue.date, "yyyy-MM-dd HH:mm:ss", new Date());
                  return isValid(parsedDate) ? (
                    <>
                      <Text style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Date: </Text>
                        {format(parsedDate, "MMMM dd, yyyy")}
                      </Text>
                      <Text style={styles.modalItem}>
                        <Text style={styles.modalLabel}>Time: </Text>
                        {format(parsedDate, "hh:mm a")}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.modalItem}><Text style={styles.modalLabel}>Date: </Text>N/A</Text>
                      <Text style={styles.modalItem}><Text style={styles.modalLabel}>Time: </Text>N/A</Text>
                    </>
                  );
                })() : ( 
                  <>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Date: </Text>N/A</Text>
                    <Text style={styles.modalItem}><Text style={styles.modalLabel}>Time: </Text>N/A</Text>
                  </>
                )}

                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Description: </Text>
                  {selectedIssue.description || "No description provided"}
                </Text>

                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Location: </Text>
                  {selectedIssue.address || "Location not available"}
                </Text>

                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Status: </Text>
                  <Text style={{
                    color: selectedIssue.status.toLowerCase() === "resolved" 
                      ? "green" 
                      : selectedIssue.status.toLowerCase() === "rejected" 
                        ? "#d00" 
                        : "#f39c12",
                    fontWeight: "bold"
                  }}>
                    {selectedIssue.status}
                  </Text>
                </Text>

                {/* View Map button */}
                {selectedIssue.location_lat && selectedIssue.location_lng && !showMap && (
                  <TouchableOpacity
                    onPress={() => setShowMap(true)}
                    style={[styles.closeButton, { backgroundColor: "#ccc", marginTop: 10 }]}
                  >
                    <Text style={styles.closeButtonText}>View Map</Text>
                  </TouchableOpacity>
                )}

                {/* Show WebView map */}
{/* Show WebView map */}
{showMap && selectedIssue.location_lat && selectedIssue.location_lng && (
  <View style={{ height: 300, width: "100%", borderRadius: 12, marginTop: 10, overflow: 'hidden' }}>
    <WebView
      source={{ uri: 'http://192.168.0.171/leaflet_map.html' }}
      injectedJavaScript={`
        const style = document.createElement('style');
        style.textContent = \`
          .leaflet-popup-content-wrapper {
            max-width: 220px !important;
            min-width: 180px !important;
            padding: 8px 10px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          
          .leaflet-popup-content {
            margin: 0 !important;
            width: auto !important;
            line-height: 1.4;
          }
          
          .leaflet-popup-content h3 {
            font-size: 14px !important;
            margin: 0 0 6px 0 !important;
            color: #073b5c;
            font-weight: bold;
          }
          
          .leaflet-popup-content p {
            font-size: 12px !important;
            margin: 0 0 6px 0 !important;
            color: #555;
          }
          
          .leaflet-popup-content img {
            max-width: 200px !important;
            max-height: 120px !important;
            height: auto;
            display: block;
            margin: 6px auto 0 auto !important;
            border-radius: 4px;
            border: 1px solid #eee;
          }
          
          .leaflet-popup-tip {
            width: 12px;
            height: 12px;
          }
        \`;
        document.head.appendChild(style);

        window.postMessage(JSON.stringify({
          lat: ${Number(selectedIssue.location_lat)},
          lng: ${Number(selectedIssue.location_lng)},
          title: "${selectedIssue.type.replace(/"/g, '\\"')}",
          address: "${(selectedIssue.address || "N/A").replace(/"/g, '\\"')}",
          image: "${selectedIssue.image_path 
            ? `http://192.168.0.171/liwad-api/uploads/${selectedIssue.image_path.replace(/^uploads\//, '')}` 
            : ''}",
          popupOptions: {
            maxWidth: 220,
            minWidth: 180,
            className: 'comfortable-popup'
          }
        }), "*");
      `}
      javaScriptEnabled={true}
      style={{ flex: 1 }}
      onMessage={(event) => {
        // Handle any messages from the WebView if needed
      }}
    />

    {/* Preview Icon - Fixed this button */}
    <TouchableOpacity
      onPress={() => {
        setShowFullMap(true);
        setShowIssueModal(false);
      }}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: 6,
      }}
    >
      <Ionicons name="expand" size={20} color="#073b5c" />
    </TouchableOpacity>
  </View>
)}

                <TouchableOpacity
                  onPress={() => {
                    setShowIssueModal(false);
                    setShowMap(false);
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Full Screen Map Modal */}
{/* Full Screen Map Modal */}
<Modal visible={showFullMap} animationType="fade" transparent={false}>
  <View style={{ flex: 1 }}>
    <TouchableOpacity
      onPress={() => {
        setShowFullMap(false);
        setShowIssueModal(true);
      }}
      style={{
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 1,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 10,
        elevation: 3,
      }}
    >
      <Ionicons name="close" size={24} color="#333" />
    </TouchableOpacity>

    {selectedIssue && (
      <WebView
        source={{ uri: 'http://192.168.0.171/leaflet_map.html' }}
        injectedJavaScript={`
          const style = document.createElement('style');
          style.textContent = \`
            .leaflet-popup-content-wrapper {
              max-width: 300px !important;
              min-width: 250px !important;
              padding: 12px 15px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .leaflet-popup-content {
              margin: 0 !important;
              width: auto !important;
              line-height: 1.5;
            }
            .leaflet-popup-content h3 {
              font-size: 16px !important;
              margin: 0 0 8px 0 !important;
              color: #073b5c;
              font-weight: bold;
            }
            .leaflet-popup-content p {
              font-size: 14px !important;
              margin: 0 0 8px 0 !important;
              color: #555;
            }
            .leaflet-popup-content img {
              max-width: 280px !important;
              max-height: 160px !important;
              height: auto;
              display: block;
              margin: 8px auto 0 auto !important;
              border-radius: 6px;
              border: 1px solid #eee;
            }
            .leaflet-popup-tip {
              width: 16px;
              height: 16px;
            }
          \`;
          document.head.appendChild(style);
          
          window.postMessage(JSON.stringify({
            lat: ${Number(selectedIssue.location_lat)},
            lng: ${Number(selectedIssue.location_lng)},
            title: "${selectedIssue.type.replace(/"/g, '\\"')}",
            address: "${(selectedIssue.address || "N/A").replace(/"/g, '\\"')}",
            image: "${selectedIssue.image_path 
              ? `http://192.168.0.171/liwad-api/uploads/${selectedIssue.image_path.replace(/^uploads\//, '')}` 
              : ''}",
            popupOptions: {
              maxWidth: 300,
              minWidth: 250,
              className: 'fullscreen-popup'
            }
          }), "*");
        `}
        javaScriptEnabled={true}
        style={{ flex: 1 }}
        onMessage={(event) => {
          // Handle any messages from the WebView if needed
        }}
      />
    )}
  </View>
</Modal>
    </View>
  );
}

/* ------------------------------- STYLES ---------------------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  container: {
    paddingTop: 120,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flex: 1,
  },

  /* Profile */
  profileCard: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginRight: 16,
    backgroundColor: "#ccc",
    transform: [{ scale: 1.1 }],
  },
  avatarPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#999",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    transform: [{ scale: 1.1 }],
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 10,
    backgroundColor: "#073b5c",
    borderRadius: 15,
    padding: 6,
    zIndex: 2,
  },
  userDetails: { flex: 1 },
  info: { fontSize: 15, marginBottom: 10, color: "#333" },
  bold: { fontWeight: "bold" },

  /* Extra info buttons */
  extraInfo: { marginTop: 20 },
  passwordButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#073b5c",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  passwordButtonText: { color: "#fff", fontSize: 13 },
  editProfileButton: { marginTop: 8, alignSelf: "flex-start" },
  editProfileText: { fontSize: 13, color: "#007bff" },

  /* Reported issues */
  reportedCard: {
    marginTop: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  reportedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  reportedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#073b5c",
  },
  filterButtons: {
    flexDirection: "row",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  filterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    marginBottom: 4,
  },
  filterBtnActive: { backgroundColor: "#073b5c" },
  filterBtnText: { fontSize: 12, color: "#333" },
  filterBtnTextActive: { color: "#fff" },

  /* Issue item */
  issueItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#073b5c",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  issueId: { fontSize: 12, marginRight: 10, color: "#555" },
  issueContent: { flex: 1 },
  issueInfo: { fontSize: 13, color: "#333" },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#073b5c",
  },
  modalItem: {
    marginBottom: 8,
    fontSize: 14,
    color: "#333",
  },
  modalLabel: {
    fontWeight: "bold",
    color: "#073b5c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  error: { color: "#d00", marginBottom: 10, fontSize: 13 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#073b5c",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  zoomedAvatar: {
    width: 300,
    height: 300,
    borderRadius: 150,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  zoomedIconContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },

  dropdownInput: {
    width: "100%",
    height: 35,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    fontStyle: "normal",
  },
  dropdownContainer: {
    borderRadius: 10,
  },
  label: {
    alignSelf: "flex-start",
    color: "#073b5c",
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: "600",
    fontSize: 13,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    overflow: "hidden",
  },

  editActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    flexWrap: "wrap",
    gap: 10,
  },

  changePwBtn: {
    backgroundColor: "#073b5c",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  changePwBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },

  actionButtonsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cancelButton: {
    backgroundColor: "#999",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
    saveButton: {
    backgroundColor: "#073b5c",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
 