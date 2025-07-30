import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hides the default header for all screens
      }}
    >
      {/* You can define specific screens here if needed, but this works globally */}
    </Stack>
  );
}
