// mainpage/layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Header from "../mainpage/header";

export default function Layout() {
  return (
    <View style={styles.container}>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#073b5c",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: "Track",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="location" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: "Report",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="create" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="faq"
          options={{
            title: "FAQ",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="help" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
