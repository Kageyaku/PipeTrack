import { StyleSheet, Text, View } from 'react-native';

export default function TechnicianHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Technician Dashboard</Text>
      <Text>Welcome to your technician portal!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});