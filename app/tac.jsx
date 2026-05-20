import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Version 1.0 • Last Updated: May 14, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.bodyText}>
            By downloading, installing, or using the FitChoice application, you agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and the FitChoice development team. If you do not agree to these terms, please do not access or use the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Health and Fitness Disclaimer</Text>
          <Text style={styles.bodyText}>
            FitChoice is a digital fitness tool intended to assist users in tracking wellness goals. The information provided—including macronutrient calculations and 3D body visualizations—is for informational purposes only. We are not a medical organization, and our staff cannot give you medical advice or diagnosis. 
            {"\n\n"}
            You should consult with a physician before starting any diet or exercise program, especially if you have a history of heart disease, high blood pressure, or other medical conditions. Reliance on any information provided by FitChoice is solely at your own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 3D Visualization & Data Accuracy</Text>
          <Text style={styles.bodyText}>
            The 3D body modeling feature is a graphical representation based on the user-provided data (weight, height, and measurements). While we strive for accuracy, these visualizations are simulations and may not perfectly reflect your physical appearance or exact body composition changes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Gamification and Rewards</Text>
          <Text style={styles.bodyText}>
            FitChoice utilizes a leveling system, experience points (XP), and virtual trophies to encourage engagement. You acknowledge that these virtual rewards have no real-world monetary value and cannot be exchanged for currency or physical goods. We reserve the right to modify the leveling logic and reward structures at any time to maintain application balance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. User Conduct and Account Security</Text>
          <Text style={styles.bodyText}>
            You are responsible for all activity that occurs under your account. You agree to provide accurate information and to update it as necessary. FitChoice reserves the right to terminate accounts that provide false data or use the application in a manner that interferes with the service for other users.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you have questions regarding these terms, please reach out via the support section in your profile settings.
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
    textAlign: 'left',
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