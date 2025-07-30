import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../header";

const faqData = [
  {
    question: "1. How do I report a pipe leak using the app?",
    answer:
      `• Tap the 'Report' button at the bottom navigation bar.\n` +
      `• Select the type of issue (e.g., pipe leak, dirty water, etc.).\n` +
      `• Fill out the form completely. Include:\n` +
      `   - Description of the issue\n` +
      `   - Exact address where the problem is occurring\n` +
      `   - A photo (optional but highly recommended for faster processing)\n` +
      `   - Allow the app to access your location to pinpoint the issue on the map\n` +
      `• Once complete, tap the 'Submit' button.\n` +
      `• Your report will be sent to our system and assigned a ticket number for tracking.`,
  },
  {
    question: "2. How long does it take for a report to be addressed?",
    answer:
      `On average, reports are reviewed by our team within 24 to 48 hours after submission.\n` +
      `Resolution times vary depending on the severity, location, and availability of field staff.\n` +
      `You will be updated once your report status changes to "in progress" or "resolved."`,
  },
  {
    question: "3. Can I track the status of my submitted reports?",
    answer:
      `Yes. To track your reports:\n` +
      `• Tap the 'Track' button in the bottom menu.\n` +
      `• You’ll see a list of your submitted reports with their status: Pending, In Progress, or Resolved.\n` +
      `• You can tap each report to view its details, including the ticket number and timestamps.`,
  },
  {
    question: "4. What should I do if I made a mistake in my report?",
    answer:
      `Currently, submitted reports cannot be edited within the app.\n` +
      `If you made a mistake, you have two options:\n` +
      `• Submit a new report with the correct information and mention that it's a correction.\n` +
      `• Or contact PrimeWater Nasugbu directly via phone or email to inform them of the correction. Include your ticket number if possible.`,
  },
  {
    question: "5. Is my personal information safe when submitting a report?",
    answer:
      `Yes. Your personal data is securely stored and handled according to data protection regulations.\n` +
      `Only authorized personnel can access your information for the purpose of resolving your report.\n` +
      `We do not share your data with third parties, and your identity remains protected throughout the process.`,
  },
  {
    question: "6. Can I report leaks or issues outside my property?",
    answer:
      `Definitely. Public issues such as pipe leaks on streets, parks, or government property are important to report.\n` +
      `Please provide a clear location (either via the map or written address) and upload a photo if possible.\n` +
      `Reporting public issues helps us respond faster and maintain better service across the community.`,
  },
];

export default function FAQScreen() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <View style={styles.screen}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>
          Find quick answers to common questions about using the app, reporting
          issues, and more.
        </Text>
        <View style={styles.divider} />

        <View style={styles.faqWrapper}>
          <ScrollView contentContainerStyle={styles.faqCard}>
            <Text style={styles.faqTitle}>FAQs:</Text>

            {faqData.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => toggleAnswer(index)}>
                <View
                  style={[
                    styles.questionBlock,
                    activeIndex === index && styles.activeBlock,
                  ]}
                >
                  <View style={styles.row}>
                    <FontAwesome
                      name="question-circle"
                      size={16}
                      color="#073b5c"
                      style={styles.icon}
                    />
                    <Text style={styles.question}>{item.question}</Text>
                    <FontAwesome
                      name={
                        activeIndex === index ? "chevron-up" : "chevron-down"
                      }
                      size={14}
                      color="#073b5c"
                      style={styles.chevron}
                    />
                  </View>
                  {activeIndex === index && (
                    <Text style={styles.answer}>{item.answer}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingTop: 120,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#073b5c",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#333",
    marginBottom: 20,
    lineHeight: 18,
    textAlign: "justify",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
  },
  faqWrapper: {
    maxHeight: 455,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  faqCard: {
    padding: 20,
  },
  faqTitle: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#073b5c",
    textAlign: "center",
    marginBottom: 12,
  },
  questionBlock: {
    borderTopWidth: 1,
    borderTopColor: "#073b5c",
    paddingVertical: 12,
  },
  activeBlock: {
    backgroundColor: "#e6f2ff",
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  icon: {
    marginRight: 8,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#073b5c",
  },
  chevron: {
    marginLeft: 8,
  },
  answer: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    paddingTop: 8,
  },
});
