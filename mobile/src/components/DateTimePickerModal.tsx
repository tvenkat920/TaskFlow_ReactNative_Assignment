import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';

interface DateTimePickerModalProps {
  visible: boolean;
  title: string;
  initialDate?: string | null;
  onConfirm: (isoString: string | null) => void;
  onCancel: () => void;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  title,
  initialDate,
  onConfirm,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return initialDate ? new Date(initialDate) : new Date();
  });

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(new Date(initialDate));
    } else {
      setSelectedDate(new Date());
    }
  }, [initialDate, visible]);

  // Shortcut setters
  const setToday = () => {
    const d = new Date();
    d.setHours(18, 0, 0, 0);
    setSelectedDate(d);
  };

  const setTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    setSelectedDate(d);
  };

  const setNextWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(18, 0, 0, 0);
    setSelectedDate(d);
  };

  const adjustDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
  };

  const adjustHour = (delta: number) => {
    const d = new Date(selectedDate);
    d.setHours(d.getHours() + delta);
    setSelectedDate(d);
  };

  const handleSave = () => {
    onConfirm(selectedDate.toISOString());
  };

  const handleClear = () => {
    onConfirm(null);
  };

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = selectedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.headerTitle}>{title}</Text>

          {/* Quick presets */}
          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetChip} onPress={setToday}>
              <Text style={styles.presetText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={setTomorrow}>
              <Text style={styles.presetText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetChip} onPress={setNextWeek}>
              <Text style={styles.presetText}>+1 Week</Text>
            </TouchableOpacity>
          </View>

          {/* Date Selector */}
          <View style={styles.selectorSection}>
            <Text style={styles.sectionLabel}>Date</Text>
            <View style={styles.adjusterRow}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustDay(-1)}>
                <Text style={styles.adjustBtnText}>◀ -1 Day</Text>
              </TouchableOpacity>
              <Text style={styles.displayValue}>{formattedDate}</Text>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustDay(1)}>
                <Text style={styles.adjustBtnText}>+1 Day ▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Selector */}
          <View style={styles.selectorSection}>
            <Text style={styles.sectionLabel}>Time</Text>
            <View style={styles.adjusterRow}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustHour(-1)}>
                <Text style={styles.adjustBtnText}>◀ -1 Hr</Text>
              </TouchableOpacity>
              <Text style={styles.displayValue}>{formattedTime}</Text>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustHour(1)}>
                <Text style={styles.adjustBtnText}>+1 Hr ▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Button
              title="Clear"
              variant="outline"
              size="sm"
              onPress={handleClear}
              style={styles.clearBtn}
            />
            <View style={styles.rightActions}>
              <Button
                title="Cancel"
                variant="secondary"
                size="sm"
                onPress={onCancel}
                style={styles.cancelBtn}
              />
              <Button
                title="Set Date"
                variant="primary"
                size="sm"
                onPress={handleSave}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  presetChip: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  presetText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  selectorSection: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  adjusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adjustBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.sm,
  },
  adjustBtnText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  displayValue: {
    ...typography.bodyBold,
    color: colors.accentLight,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  clearBtn: {
    borderColor: colors.danger,
  },
  rightActions: {
    flexDirection: 'row',
  },
  cancelBtn: {
    marginRight: spacing.sm,
  },
});
