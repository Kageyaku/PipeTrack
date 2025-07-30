import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { WebView } from "react-native-webview";
import Header from "../header";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Intro Section */}
        <View style={styles.introContainer}>
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../../assets/images/pipetrack-logo.png")}
              style={styles.logo}
            />
          </View>

          {/* Description */}
          <Text style={styles.description}>
            <Text style={styles.boldItalic}>PipeTrack</Text> enables customers to easily report pipeline issues by pinpointing exact locations on the map and submitting details such as issue type, description, and supporting images.
          </Text>
        </View>

        {/* Image with Caption */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../assets/images/images.jpg")}
            style={styles.partnerImage}
            resizeMode="cover"
          />
          <Text style={styles.caption}>LIWAD crew on-site inspecting pipelines (Dummy caption)</Text>
        </View>

        {/* LIWAD Section */}
        <Text style={styles.sectionTitle}>About LIWAD</Text>

        <View style={styles.card}>
          <Text style={styles.paragraph1}>
            <Text style={{ fontStyle: "italic" }}>Lian Water District (LIWAD)</Text> is a trusted local water service provider dedicated to delivering reliable, safe, and sustainable water supply to the residents of Lian, Batangas. With a mission centered on community welfare, LIWAD ensures access to clean water that supports everyday life and local development.
          </Text>

          <View style={styles.cardImageWrapper}>
            <Image
              source={require("../../../assets/images/office.jpg")}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <Text style={styles.imageCaption}>Lian Water District Office</Text>
          </View>

          <Text style={styles.paragraph}>
            LIWAD continuously strives to enhance its water distribution systems through infrastructure upgrades and modern technologies. From leak detection initiatives to proactive pipeline maintenance, the organization ensures operational efficiency and minimizes service interruptions. Its dedicated workforce is trained to respond quickly and effectively to service concerns, reflecting their strong commitment to public satisfaction.
          </Text>

          <Text style={styles.paragraph}>
            Beyond its core services, LIWAD actively engages in community outreach programs, promoting water conservation and environmental awareness. They collaborate with local schools, barangays, and civic groups to educate the public about the importance of responsible water use. This holistic approach to service — combining technical excellence with community partnership — makes LIWAD an essential pillar in the development of Lian.
          </Text>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>Our Office Location</Text>
              <Text style={styles.previewButton} onPress={() => setModalVisible(true)}>
                Preview Map
              </Text>
            </View>
<View style={styles.mapWrapper}>
  <WebView
    originWhitelist={["*"]}
    style={{ flex: 1 }}
    source={{
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
            html, body, #map {
              height: 100%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            document.addEventListener("DOMContentLoaded", function () {
              var map = L.map('map').setView([14.03716337270626, 120.65664742191878], 18);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data © OpenStreetMap contributors'
              }).addTo(map);
              L.marker([14.03716337270626, 120.65664742191878])
                .addTo(map)
                .bindPopup('LIWAD Office<br>Dona Salome Subdivision, Lian, Batangas')
                .openPopup();
            });
          </script>
        </body>
        </html>
      `,
    }}
  />
</View>
          </View>

<Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
  <View style={styles.modalContainer}>
    <WebView
      originWhitelist={["*"]}
      style={{ flex: 1 }}
      source={{
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>
              html, body, #map {
                height: 100%;
                margin: 0;
                padding: 0;
              }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <script>
              document.addEventListener("DOMContentLoaded", function () {
                var map = L.map('map').setView([14.03716337270626, 120.65664742191878], 18);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: 'Map data © OpenStreetMap contributors'
                }).addTo(map);
                L.marker([14.03716337270626, 120.65664742191878])
                  .addTo(map)
                  .bindPopup('LIWAD Office<br>Dona Salome Subdivision, Lian, Batangas')
                  .openPopup();
              });
            </script>
          </body>
          </html>
        `,
      }}
    />
    <View style={styles.closeButtonContainer}>
      <Text style={styles.closeButton} onPress={() => setModalVisible(false)}>
        Close
      </Text>
    </View>
  </View>
</Modal>


          {/* Divider */}
          <View style={styles.divider} />

          {/* Contact Section */}
          <Text style={styles.contactTitle}>Contact Us</Text>

          <View style={styles.contactRow}>
            <Ionicons name="location" size={18} color="#073b5c" />
            <Text style={styles.contactText}>
              Dona Salome Subdivision, Brgy. Malaruhatan, Lian, Batangas
            </Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="call" size={18} color="#073b5c" />
            <Text style={styles.contactText}>0917 590 6463</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="mail" size={18} color="#073b5c" />
            <Text
              style={[styles.contactText, { textDecorationLine: "underline" }]}
              onPress={() => Linking.openURL("mailto:lianwaterdistrict@yahoo.com")}
            >
              lianwaterdistrict@yahoo.com
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: {
    padding: 20,
    paddingTop: 120,
    paddingBottom: 100,
    alignItems: "center",
  },
  logoWrapper: {
    width: 400,
    height: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    transform: [{ scale: 1.7 }],
  },
  description: {
    color: "#073b5c",
    fontSize: 11,
    marginBottom: 10,
    textAlign: "justify",
  },
  boldItalic: { fontWeight: "bold", fontStyle: "italic" },
  imageContainer: { alignItems: "center", marginBottom: 20 },
  partnerImage: { width: 200, height: 200, borderRadius: 12 },
  caption: { fontSize: 12, color: "#555", marginTop: 8, fontStyle: "italic" },
  sectionTitle: {
    alignSelf: "flex-start",
    fontStyle: "italic",
    color: "#007aff",
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#f6f6f6",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    elevation: 2,
  },
  paragraph: {
    fontSize: 13,
    color: "#444",
    textAlign: "justify",
    marginBottom: 50,
  },
  paragraph1: {
    fontSize: 13,
    color: "#444",
    textAlign: "justify",
    marginBottom: 50,
    marginTop: 15,
  },
  divider: {
    borderBottomColor: "#aaa",
    borderBottomWidth: 1,
    marginVertical: 15,
    width: "80%",
    alignSelf: "center",
  },
  contactTitle: { fontWeight: "bold", color: "#073b5c", marginBottom: 10 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactText: { marginLeft: 8, fontSize: 13, color: "#333", flexShrink: 1 },
  introContainer: {
    alignItems: "center",
    marginBottom: 25,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImageWrapper: { marginVertical: 12, alignItems: "center" },
  cardImage: { width: "100%", height: 160, borderRadius: 8 },
  imageCaption: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
    textAlign: "center",
  },
  mapContainer: { marginTop: 20, marginBottom: 20 },
  mapTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#073b5c",
    marginBottom: 8,
  },
  mapWrapper: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
  },
  map: { ...StyleSheet.absoluteFillObject },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  previewButton: {
    color: "#007aff",
    fontSize: 13,
    textDecorationLine: "underline",
  },
modalContainer: {
  flex: 1,
  backgroundColor: "#fff",
},
  closeButtonContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  closeButton: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});