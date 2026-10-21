import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { useTasks } from '../context/TaskContext';
import { taskFormSchema, TaskFormData } from '../validation/taskSchema';
import { RootStackParamList, TaskPriority } from '../types';
import { formatDateTime } from '../utils/date';

const defaultCategories = ['General', 'Work', 'Personal', 'Urgent', 'Study', 'Finance', 'Health'];
const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const AddEditTaskScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'AddEditTask'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { createTask, updateTask } = useTasks();

  const taskId = route.params?.taskId;
  const initialData = route.params?.initialData;
  const isEditing = Boolean(taskId);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activePicker, setActivePicker] = useState<'scheduled' | 'due' | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: (initialData?.priority as TaskPriority) || 'Medium',
      category: initialData?.category || 'General',
      scheduledAt: initialData?.scheduledAt || null,
      dueAt: initialData?.dueAt || null,
    },
  });

  const selectedPriority = watch('priority');
  const selectedCategory = watch('category');
  const scheduledAt = watch('scheduledAt');
  const dueAt = watch('dueAt');

  const onSubmit = async (data: TaskFormData) => {
    try {
      setSubmitting(true);
      if (isEditing && taskId) {
        await updateTask(taskId, data);
      } else {
        await createTask(data);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={isEditing ? 'Edit Task' : 'New Task'}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Title Input */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Task Title *"
                placeholder="What needs to be done?"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          {/* Description Input */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Description"
                placeholder="Add optional notes, links, or context..."
                multiline
                numberOfLines={3}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.description?.message}
              />
            )}
          />

          {/* Priority Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.priorityGrid}>
              {priorities.map((p) => {
                const isSelected = selectedPriority === p;
                const pColor = colors.priority[p];
                return (
                  <TouchableOpacity
                    key={p}
                    activeOpacity={0.7}
                    onPress={() => setValue('priority', p)}
                    style={[
                      styles.priorityOption,
                      isSelected && { borderColor: pColor, backgroundColor: `${pColor}25` },
                    ]}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: pColor }]} />
                    <Text
                      style={[
                        styles.priorityText,
                        isSelected ? { color: pColor, fontWeight: '700' } : { color: colors.textSecondary },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {defaultCategories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.7}
                    onPress={() => setValue('category', cat)}
                    style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                  >
                    <Text
                      style={[styles.categoryText, isSelected && styles.categoryTextActive]}
                    >
                      #{cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Date & Time Selectors */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Schedule & Deadlines</Text>

            {/* Scheduled Date Button */}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setActivePicker('scheduled')}
            >
              <Text style={styles.datePickerLabel}>Scheduled At:</Text>
              <Text style={styles.datePickerValue}>{formatDateTime(scheduledAt)}</Text>
            </TouchableOpacity>

            {/* Due Deadline Button */}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setActivePicker('due')}
            >
              <Text style={styles.datePickerLabel}>Due Deadline:</Text>
              <Text style={[styles.datePickerValue, Boolean(dueAt) && styles.deadlineHighlight]}>
                {formatDateTime(dueAt)}
              </Text>
            </TouchableOpacity>

            {errors.scheduledAt?.message && (
              <Text style={styles.dateErrorText}>{errors.scheduledAt.message}</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="secondary"
              size="lg"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
            <Button
              title={isEditing ? 'Save Changes' : 'Create Task'}
              variant="primary"
              size="lg"
              loading={submitting}
              onPress={handleSubmit(onSubmit)}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      <DateTimePickerModal
        visible={activePicker === 'scheduled'}
        title="Schedule Task"
        initialDate={scheduledAt}
        onConfirm={(iso) => {
          setValue('scheduledAt', iso);
          setActivePicker(null);
        }}
        onCancel={() => setActivePicker(null)}
      />

      <DateTimePickerModal
        visible={activePicker === 'due'}
        title="Set Deadline"
        initialDate={dueAt}
        onConfirm={(iso) => {
          setValue('dueAt', iso);
          setActivePicker(null);
        }}
        onCancel={() => setActivePicker(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  priorityText: {
    ...typography.caption,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.accentLight,
    fontWeight: '700',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  datePickerLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  datePickerValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  deadlineHighlight: {
    color: colors.accentLight,
  },
  dateErrorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
