import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { format, isValid, parse } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from 'react-native-webview';
import { getData } from "../../utils/storage";
import Header from "../header";

interface Feedback {
  message: string;
  rating: number;
  date: string;
}

interface Report {
  report_id: string;
  user_id: string;
  ticketNo: string;
  type: string;
  date: string;
  address: string;
  status: string;
  description: string;
  location_lat: string | number; // Allow both string and number
  location_lng: string | number; // Allow both string and number
  image_path?: string;
}

export default function TrackScreen() {
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Report | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);
  const [slideAnim] = useState(new Animated.Value(0));
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const deleteButtonAnim = useRef(new Animated.Value(50)).current;
  const API_URL = 'http://192.168.0.171/liwad-api';
  const [showFullMap, setShowFullMap] = useState(false);

  // Debug function to log image details
  const logImageDetails = (ticket: Report) => {
    if (!ticket.image_path) {
      console.log('No image path in ticket data');
      return;
    }

    const fullImageUrl = `http://192.168.0.171/liwad-api/uploads/${ticket.image_path}`;
    console.log('Image details:', {
      raw_path: ticket.image_path,
      constructed_url: fullImageUrl,
      exists_in_db: !!ticket.image_path
    });

    // Test if image is accessible
    fetch(fullImageUrl)
      .then(response => {
        console.log('Image accessibility check:', {
          url: fullImageUrl,
          status: response.status,
          accessible: response.ok
        });
      })
      .catch(error => {
        console.log('Image accessibility error:', error);
      });
  };

  const handleLongPress = (ticketId: string) => {
    setActiveTicketId(ticketId);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(deleteButtonAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      resetSlide();
    }, 5000);
  };

  const resetSlide = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(deleteButtonAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTicketId(null);
    });
  };

  const handleDelete = async (ticket_no: string) => {
    console.log("Deleting ticket:", ticket_no);

    try {
      const response = await axios.post(`${API_URL}/reports/delete_report.php`, {
        ticket_no,
      });

      console.log("Response:", response.data);

      if (response.data.success) {
        Alert.alert("Deleted", "Report successfully marked as deleted.");
        setReports((prev) => prev.filter((r) => r.ticketNo !== ticket_no));
        setFilteredReports((prev) => prev.filter((r) => r.ticketNo !== ticket_no));
      } else {
        Alert.alert("Error", response.data.message || "Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const user = await getData("user");
      setUserId(user?.user_id || null);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      axios
        .get(`${API_URL}/reports/get_feedback.php?report_id=${selectedTicket.report_id}`)
        .then((res) => {
          if (res.data.success && res.data.feedback) {
            setExistingFeedback({
              message: res.data.feedback.message,
              rating: res.data.feedback.rating,
              date: res.data.feedback.date,
            });
          } else {
            setExistingFeedback(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching feedback:", err);
        });
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (!userId) return;

    const fetchReports = () => {
      axios
        .get(`${API_URL}/reports/list.php`)
        .then((response) => {
          if (response.data.success) {
            const filtered = response.data.data.filter((report: any) => {
              const reportUserId = Number(report.user_id);
              const currentUserId = Number(userId);
              const status = report.status?.toLowerCase().trim();
              const match = reportUserId === currentUserId;

              return (
                (status === "in_progress" || status === "resolved") &&
                match &&
                report.is_deleted != 1
              );
            });

            if (JSON.stringify(filtered) !== JSON.stringify(reports)) {
              setReports(filtered);
              setFilteredReports(filtered);
            }
          } else {
            Alert.alert("Error", response.data.message || "Failed to fetch reports");
          }
        })
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    };

    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, [userId]);

const handleTicketPress = async (ticket: Report) => {
  console.log('Selected ticket:', ticket);
  logImageDetails(ticket);
  
  // Create a new object with parsed numbers but keep original string values
  const updatedTicket = {
    ...ticket,
    location_lat: parseFloat(ticket.location_lat as string),
    location_lng: parseFloat(ticket.location_lng as string),
    original_lat: ticket.location_lat, // preserve original string values
    original_lng: ticket.location_lng  // preserve original string values
  };
  
  setSelectedTicket(updatedTicket);
  setModalVisible(true);
  setShowMap(false);

  if (ticket.status.toLowerCase() === "resolved") {
    try {
      const response = await axios.get(
        `${API_URL}/reports/get_feedback.php?report_id=${ticket.report_id}`
      );
      if (response.data.success && response.data.feedback) {
        setExistingFeedback(response.data.feedback);
      } else {
        setExistingFeedback(null);
      }
    } catch (error) {
      console.error("Feedback check error:", error);
      setExistingFeedback(null);
    }
  } else {
    setExistingFeedback(null);
  }
};


  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = reports.filter((ticket) =>
      ticket.ticketNo.toLowerCase().includes(text.toLowerCase()) ||
      ticket.type.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredReports(filtered);
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert("Empty Review", "Please enter a review before submitting.");
      return;
    }
    if (rating === null) {
      Alert.alert("No Rating", "Please select a star rating before submitting.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/reports/create_feedback.php`,
        {
          user_id: selectedTicket?.user_id,
          report_id: selectedTicket?.report_id,
          message: reviewText,
          rating: rating,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (res.data.success) {
        Alert.alert("Success", "Thank you for your feedback!");
        setReviewText("");
        setRating(null);
        setReviewModalVisible(false);
        setModalVisible(false);
      } else {
        Alert.alert("Error", res.data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error("Feedback error:", err);
      Alert.alert("Error", "Something went wrong while submitting feedback.");
    }
  };

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Track Report</Text>
        <Text style={styles.description}>
          Track Report Status lets you stay updated on the progress of your reported pipe issue.
        </Text>

        <View style={styles.searchFilterRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#888" style={styles.searchIcon} />
            <TextInput
              placeholder="Search"
              style={styles.searchInput}
              value={search}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Ionicons name="filter" size={20} color="#073b5c" />
          </TouchableOpacity>
        </View>

        <View style={styles.ticketList}>
          {filteredReports.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#999", padding: 20 }}>
              No reports found.
            </Text>
          ) : (
            filteredReports.map((ticket) => {
              const isActive = activeTicketId === ticket.report_id;
              const key = ticket.report_id || ticket.ticketNo || Math.random().toString();
              const translateX = slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -40],
              });

              return (
                <View key={key} style={{ overflow: 'hidden' }}>
                  {isActive && (
                    <Animated.View
                      style={[
                        styles.deleteButtonContainer,
                        {
                          transform: [{ translateX: deleteButtonAnim }],
                          position: 'absolute',
                          right: 16,
                          top: 20,
                          zIndex: 999,
                          pointerEvents: 'auto',
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          if (ticket.status?.toLowerCase().trim() === "in_progress") {
                            Alert.alert(
                              "Deletion Not Allowed",
                              "This report is already approved and being processed by a technician."
                            );
                            return;
                          }
                          Alert.alert(
                            "Delete Report",
                            "Are you sure you want to delete this report?",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => handleDelete(ticket.ticketNo),
                              },
                            ]
                          );
                        }}
                      >
                        <Ionicons name="trash-outline" size={24} color="#d11a2a" />
                      </TouchableOpacity>
                    </Animated.View>
                  )}

                  <TouchableOpacity
                    style={styles.ticketItem}
                    onPress={() => handleTicketPress(ticket)}
                    onLongPress={() => handleLongPress(ticket.report_id)}
                    delayLongPress={300}
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={{
                        transform: [{ translateX: isActive ? translateX : new Animated.Value(0) }],
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                      }}
                    >
                      <View
                        style={[
                          styles.statusIndicator,
                          ticket.status === 'in_progress'
                            ? styles.statusInProgress
                            : styles.statusResolved,
                        ]}
                      />
                      <Text style={styles.ticketNo}>{ticket.ticketNo}</Text>
                      <View style={styles.ticketDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>Type: </Text>
                          <Text style={styles.value}>{ticket.type}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>Date: </Text>
                          <Text style={styles.value}>{ticket.date}</Text>
                        </View>
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Ticket Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
            setShowMap(false);
          }}
          style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setShowMap(false);
              }}>
                <Ionicons name="close" size={24} color="#073b5c" />
              </TouchableOpacity>
            </View>
            {selectedTicket && (
              <>
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Type: </Text>{selectedTicket.type}
                </Text>

                {selectedTicket?.date ? (() => {
                  const parsedDate = parse(selectedTicket.date, "yyyy-MM-dd HH:mm:ss", new Date());
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
                  {selectedTicket.description || "No description provided"}
                </Text>

                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Location: </Text>
                  {selectedTicket.address || "Location not available"}
                </Text>

                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Status: </Text>
                  <Text style={{
                    color: selectedTicket.status.toLowerCase() === "resolved" 
                      ? "green" 
                      : selectedTicket.status.toLowerCase() === "rejected" 
                        ? "#d00" 
                        : "#f39c12",
                    fontWeight: "bold"
                  }}>
                    {selectedTicket.status}
                  </Text>
                </Text>

                {selectedTicket.status === "resolved" && existingFeedback && (
                  <View style={styles.feedbackBox}>
                    <Text style={styles.modalItem}>
                      <Text style={styles.modalLabel}>Your Feedback:</Text>
                    </Text>
                    <Text style={{ fontStyle: 'italic' }}>{existingFeedback.message}</Text>
                    <Text style={{ color: "#888" }}>
                      ⭐ {existingFeedback.rating} stars — {format(new Date(existingFeedback.date), "MMM dd, yyyy")}
                    </Text>
                  </View>
                )}

                {selectedTicket.location_lat && selectedTicket.location_lng && !showMap && (
                  <TouchableOpacity
                    onPress={() => setShowMap(true)}
                    style={[styles.closeButton, { backgroundColor: "#ccc", marginTop: 10 }]}
                  >
                    <Text style={styles.closeButtonText}>View Map</Text>
                  </TouchableOpacity>
                )}

                    {showMap && selectedTicket && (
                      <View style={{ height: 300, width: "100%", borderRadius: 12, marginTop: 10, overflow: 'hidden' }}>
                        <WebView
                          source={{ uri: 'http://192.168.0.171/leaflet_map.html' }}
                    injectedJavaScript={`
                      const style = document.createElement('style');
                      style.textContent = \`
                        .leaflet-popup-content-wrapper {
                          max-width: 220px !important;  /* Optimal width for readability */
                          min-width: 180px !important;
                          padding: 8px 10px;           /* Comfortable padding */
                          border-radius: 8px;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        }
                        
                        .leaflet-popup-content {
                          margin: 0 !important;
                          width: auto !important;
                          line-height: 1.4;           /* Better text spacing */
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
                          max-width: 200px !important;  /* Slightly smaller than wrapper */
                          max-height: 120px !important; /* Constrained but visible */
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
                        lat: ${Number(selectedTicket.location_lat)},
                        lng: ${Number(selectedTicket.location_lng)},
                        title: "${selectedTicket.type.replace(/"/g, '\\"')}",
                        address: "${(selectedTicket.address || "N/A").replace(/"/g, '\\"')}",
                        image: "${selectedTicket.image_path 
                          ? `http://192.168.0.171/liwad-api/uploads/${selectedTicket.image_path.replace(/^uploads\//, '')}` 
                          : ''}",
                        popupOptions: {
                          maxWidth: 220,    /* Matches CSS */
                          minWidth: 180,    /* Prevents too narrow */
                          className: 'comfortable-popup'
                        }
                      }), "*");
                    `}
                          javaScriptEnabled={true}
                        />
                        <TouchableOpacity
                          onPress={() => setShowFullMap(true)}
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
                    if (selectedTicket.status === "resolved" && !existingFeedback) {
                      setReviewModalVisible(true);
                    } else {
                      setModalVisible(false);
                      setShowMap(false);
                    }
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>
                    {selectedTicket.status === "resolved" && !existingFeedback
                      ? "Create Feedback"
                      : "Close"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Full Screen Map Modal */}
        <Modal visible={showFullMap} animationType="fade" transparent={false}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => setShowFullMap(false)}
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

            {selectedTicket && (
              // In your React Native code where you have the WebView
              <WebView
                source={{ uri: 'http://192.168.0.171/leaflet_map.html' }}
                injectedJavaScript={`
                  // Add style element to head
                  const style = document.createElement('style');
                  style.textContent = \`
                    .leaflet-popup-content-wrapper {
                      border-radius: 4px;
                      padding: 1px;
                    }
                    .leaflet-popup-content {
                      margin: 8px;
                    }
                    .leaflet-popup-content img {
                      max-width: 200px;
                      height: auto;
                      display: block;
                      margin: 5px auto;
                    }
                  \`;
                  document.head.appendChild(style);
                  
                  // Your existing postMessage code
                  window.postMessage(JSON.stringify({
                    lat: ${Number(selectedTicket.location_lat)},
                    lng: ${Number(selectedTicket.location_lng)},
                    title: "${selectedTicket.type.replace(/"/g, '\\"')}",
                    address: "${(selectedTicket.address || "N/A").replace(/"/g, '\\"')}",
                    image: "${selectedTicket.image_path 
                      ? `http://192.168.0.171/liwad-api/uploads/${selectedTicket.image_path.replace(/^uploads\//, '')}` 
                      : ''}"
                  }), "*");
                `}
                javaScriptEnabled={true}
              />
            )}
          </View>
        </Modal>

      {/* Review Modal */}
      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {existingFeedback ? (
              <>
                <Text style={styles.modalTitle}>Your Feedback</Text>
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Message: </Text>
                  {existingFeedback.message}
                </Text>
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Rating: </Text>
                  {existingFeedback.rating} ⭐
                </Text>
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Date: </Text>
                  {format(new Date(existingFeedback.date), "MMMM dd, yyyy")}
                </Text>
                <TouchableOpacity
                  onPress={() => setReviewModalVisible(false)}
                  style={[styles.closeButton, { marginTop: 20 }]}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Submit Review</Text>
                <TextInput
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  numberOfLines={4}
                  style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                />
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Ionicons
                        name={star <= (rating ?? 0) ? "star" : "star-outline"}
                        size={32}
                        color="#FFD700"
                        style={styles.star}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ color: "#888", fontSize: 12 }}>
                  {rating ? `You rated: ${rating} star${rating > 1 ? "s" : ""}` : "Select a rating"}
                </Text>
                <TouchableOpacity onPress={handleSubmitReview} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setReviewModalVisible(false)}
                  style={[styles.closeButton, { backgroundColor: "#999", marginTop: 10 }]}
                >
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Reports</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.filterField}
            >
              <Text style={styles.modalLabel}>Date:</Text>
              <Text>{filterDate ? format(filterDate, "MMMM d, yyyy") : "Select date"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={filterDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setFilterDate(selectedDate);
                }}
              />
            )}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  const filtered = reports.filter((ticket) =>
                    filterDate
                      ? ticket.date === format(filterDate, "MMMM d, yyyy")
                      : true
                  );
                  setFilteredReports(filtered);
                  setShowFilterModal(false);
                }}
                style={[styles.closeButton, { marginRight: 10 }]}
              >
                <Text style={styles.closeButtonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setFilterDate(null);
                  setFilteredReports(reports);
                  setShowFilterModal(false);
                }}
                style={[styles.closeButton, { backgroundColor: "#999" }]}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#fff" },
    container: {
      paddingTop: 120,
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    title: {
      fontSize: 50,
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
    searchFilterRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingHorizontal: 10,
      height: 40,
      backgroundColor: "#f5f5f5",
    },
    modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

    searchIcon: {
      marginRight: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: "#333",
    },
    filterButton: {
      marginLeft: 10,
      padding: 8,
      borderRadius: 8,
      backgroundColor: "#f0f0f0",
      borderWidth: 1,
      borderColor: "#ccc",
    },
    ticketList: {
      borderWidth: 1,
      borderColor: "#999",
      borderRadius: 10,
      overflow: "hidden",
    },
ticketItem: {
  padding: 16,
  backgroundColor: "#fff",
  borderBottomWidth: 1,
  borderBottomColor: "#e0e0e0", // or any light gray
},
    ticketNo: {
      width: 80,
      fontWeight: "bold",
      color: "#073b5c",
    },
    ticketDetails: {
      flex: 1,
    },
    detailRow: {
      flexDirection: "row",
      marginBottom: 3,
    },
    label: {
      fontWeight: "600",
      color: "#333",
    },
    value: {
      color: "#073b5c",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 20,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
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
    filterField: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: "#ccc",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 10,
      backgroundColor: "#f9f9f9",
      fontSize: 14,
      color: "#333",
      marginBottom: 10,
    },
    ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  star: {
    marginHorizontal: 4,
  },
  feedbackBox: {
  backgroundColor: "#f9f9f9",
  borderRadius: 8,
  padding: 10,
  marginTop: 10,
  borderWidth: 1,
  borderColor: "#ccc",
},

statusIndicator: {
  position: "absolute",
  top: 10,
  right: 10,
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: "#ccc",
},

statusInProgress: {
  backgroundColor: "#facc15", // yellow-400
},

statusResolved: {
  backgroundColor: "#22c55e", // green-500
},

deleteButtonContainer: {
  backgroundColor: 'transparent',
  padding: 4,
},


  });
