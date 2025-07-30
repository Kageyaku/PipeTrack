import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import FAQScreen from "../mainpage/tabs/faq";
import HomeScreen from "../mainpage/tabs/home";
import ProfileScreen from "../mainpage/tabs/profile";
import ReportScreen from "../mainpage/tabs/report";
import TrackScreen from "../mainpage/tabs/track";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#073b5c",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Report") iconName = "create";
          else if (route.name === "Track") iconName = "location";
          else if (route.name === "FAQ") iconName = "help-circle";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size + 3} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Track" component={TrackScreen} />
      <Tab.Screen name="FAQ" component={FAQScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
