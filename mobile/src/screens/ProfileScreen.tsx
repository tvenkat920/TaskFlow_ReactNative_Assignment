import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { API_CONFIG } from '../config/api';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { stats } = useTasks();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'TaskFlow User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Lifetime Productivity Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productivity Statistics</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Created Tasks</Text>
              <Text style={styles.statValue}>{stats.total}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Completed Tasks</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {stats.completed}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Pending Tasks</Text>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {stats.pending}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Overdue Tasks</Text>
              <Text style={[styles.statValue, { color: colors.danger }]}>
                {stats.overdue}
              </Text>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>Overall Completion Rate</Text>
              <Text style={[styles.statValue, { color: colors.primaryLight }]}>
                {completionRate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Environment & Network Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment & Network</Text>
          <View style={styles.infoCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Active Backend URL</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {API_CONFIG.BASE_URL}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Theme</Text>
              <Text style={styles.infoValue}>Dark Navy & Electric Blue</Text>
            </View>
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0 (Production Release)</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Log Out"
          variant="danger"
          size="lg"
          onPress={() => setShowLogoutModal(true)}
          style={styles.logoutButton}
        />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out? Your session token will be securely removed from this device."
        confirmText="Sign Out"
        confirmVariant="danger"
        loading={isLoggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
  },
  infoValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});
