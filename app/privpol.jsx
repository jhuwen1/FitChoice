import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Version 1.0 • Last Updated: May 14, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Data Collection</Text>
          <Text style={styles.bodyText}>
            FitChoice collects personal data that you provide directly to us, including your email, password, age, gender, height, and weight. This information is essential for generating your 3D body visualization and calculating accurate macronutrient targets.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Fitness & Health Data</Text>
          <Text style={styles.bodyText}>
            To facilitate our gamified fitness experience, we track activity metrics such as step counts and daily nutritional intake. This data is used solely to update your user level, award trophies, and visualize physical progress within the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Use of 3D Modeling</Text>
          <Text style={styles.bodyText}>
            The 3D visualizations created in FitChoice are stored locally on your device or securely in our database to allow you to track changes over time. We do not share these graphical representations with third-party advertisers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.bodyText}>
            We implement industry-standard security measures to protect your information. As part of our current development, we are prioritizing the integration of a secure User Authentication system to ensure only you can access your fitness data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.bodyText}>
            You have the right to access, correct, or delete your personal information at any time through the profile settings. If you choose to delete your account, all associated progress, including XP and trophies, will be permanently removed.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For privacy-related inquiries, please contact the development team at support@fitchoice.app
          </Text>
        </View>
        
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFF', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F0F2F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 15,
    color: '#1A1C1E',
  },
  scrollContent: {
    padding: 25,
  },
  lastUpdated: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 25,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4A90E2', 
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  footer: {
    marginTop: 10,
    padding: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});