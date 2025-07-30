import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../mainpage/tabs/home";

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  );
}
