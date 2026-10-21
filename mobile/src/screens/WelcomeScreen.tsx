import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from '../components/Button';
import { RootStackParamList } from '../types';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Emblem & Branding */}
        <View style={styles.heroSection}>
          <View style={styles.emblemContainer}>
            <Text style={styles.emblemText}>⚡</Text>
          </View>
          <Text style={styles.brandTitle}>Task<Text style={styles.brandAccent}>Flow</Text></Text>
          <Text style={styles.tagline}>Intelligent task management built for focus and speed.</Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Deterministic Ranking</Text>
              <Text style={styles.featureDesc}>
                Overdue items and imminent deadlines automatically surface first.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔒</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Enterprise-Grade Security</Text>
              <Text style={styles.featureDesc}>
                Scoped JWT tokens and encrypted password hashing isolate your data.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Real-Time Metrics</Text>
              <Text style={styles.featureDesc}>
                Instant visibility into completed, pending, and overdue commitments.
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <Button
            title="Create Free Account"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate('Register')}
            style={styles.primaryButton}
          />
          <Button
            title="I already have an account"
            variant="secondary"
            size="lg"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emblemContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  emblemText: {
    fontSize: 38,
  },
  brandTitle: {
    ...typography.h1,
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  brandAccent: {
    color: colors.accent,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  featuresSection: {
    marginVertical: spacing.xxl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 2,
  },
  featureDesc: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  actionSection: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
});
