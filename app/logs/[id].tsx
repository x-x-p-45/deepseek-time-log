import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTimeLogStore } from '../../src/store/timeLogStore';
import { generateUUID } from '../../src/utils/uuid';
import { formatDateTime } from '../../src/utils/dateFormatter';
import { TimeLog, LogCategory } from '../../src/types';

type PickerMode = 'start' | 'end';

export default function LogEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isNew = id === 'new';

  const logs = useTimeLogStore((s) => s.logs);
  const categories = useTimeLogStore((s) => s.categories);
  const addLog = useTimeLogStore((s) => s.addLog);
  const updateLog = useTimeLogStore((s) => s.updateLog);

  const existingLog = !isNew ? logs.find((l) => l.id === id) : undefined;

  // 表单状态
  const [title, setTitle] = useState(existingLog?.title ?? '');
  const [startTime, setStartTime] = useState(existingLog?.startTime ?? Date.now());
  const [endTime, setEndTime] = useState(
    existingLog?.endTime ?? Date.now() + 3600000
  );
  const [selectedCategory, setSelectedCategory] = useState<LogCategory>(
    existingLog?.category ?? categories.find((c) => c.isDefault && c.name === 'AI 对话') ?? categories[0]
  );
  const [note, setNote] = useState(existingLog?.note ?? '');

  // 日期选择器
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>('start');

  // 表单校验错误
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});

  const openDatePicker = useCallback((mode: PickerMode) => {
    setPickerMode(mode);
    setShowPicker(true);
  }, []);

  const handleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      // Android 上 dismiss 也会触发
      if (event.type === 'dismissed') {
        setShowPicker(false);
        return;
      }

      if (selectedDate) {
        if (pickerMode === 'start') {
          setStartTime(selectedDate.getTime());
        } else {
          setEndTime(selectedDate.getTime());
        }
      }

      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
    },
    [pickerMode]
  );

  // iOS 上点击完成关闭
  const closeIOSPicker = useCallback(() => {
    if (Platform.OS === 'ios') {
      setShowPicker(false);
    }
  }, []);

  // 表单校验
  const validate = useCallback((): boolean => {
    const newErrors: { title?: string; time?: string } = {};

    if (!title.trim()) {
      newErrors.title = '请输入日志标题';
    } else if (title.trim().length > 100) {
      newErrors.title = '标题不能超过100个字符';
    }

    if (endTime <= startTime) {
      newErrors.time = '结束时间必须晚于开始时间';
    }

    // 不允许超过 30 天的单条记录
    const maxDuration = 30 * 24 * 60 * 60 * 1000;
    if (endTime - startTime > maxDuration) {
      newErrors.time = '单条日志时长不能超过30天';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, startTime, endTime]);

  // 保存
  const handleSave = useCallback(async () => {
    if (!validate()) return;

    const duration = endTime - startTime;
    const now = Date.now();

    if (isNew) {
      const log: TimeLog = {
        id: generateUUID(),
        title: title.trim(),
        category: selectedCategory,
        startTime,
        endTime,
        duration,
        note: note.trim(),
        isAuto: false,
        sourcePage: 'custom',
        createdAt: now,
        updatedAt: now,
      };
      await addLog(log);
    } else if (existingLog) {
      const log: TimeLog = {
        ...existingLog,
        title: title.trim(),
        category: selectedCategory,
        startTime,
        endTime,
        duration,
        note: note.trim(),
        updatedAt: now,
      };
      await updateLog(log);
    }

    router.back();
  }, [isNew, existingLog, validate, title, selectedCategory, startTime, endTime, note, addLog, updateLog, router]);

  // 删除
  const handleDelete = useCallback(() => {
    if (!existingLog) return;
    Alert.alert('确认删除', `确定要删除日志「${existingLog.title}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await useTimeLogStore.getState().deleteLog(existingLog.id);
          router.back();
        },
      },
    ]);
  }, [existingLog, router]);

  // 分类选择
  const selectCategory = useCallback((cat: LogCategory) => {
    setSelectedCategory(cat);
  }, []);

  const bgColor = isDark ? '#1A1A2E' : '#F8F9FA';
  const cardBg = isDark ? '#2D2D44' : '#FFFFFF';
  const textColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const subColor = isDark ? '#ADB5BD' : '#6C757D';
  const inputBg = isDark ? '#1A1A2E' : '#F0F0F0';
  const inputTextColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const borderColor = isDark ? '#3D3D5C' : '#E9ECEF';
  const errorColor = '#E74C3C';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* 标题 */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: subColor }]}>标题 *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBg, color: inputTextColor, borderColor: errors.title ? errorColor : borderColor },
            ]}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
            }}
            placeholder="日志标题（如：编写登录页面）"
            placeholderTextColor={subColor}
            maxLength={100}
            autoFocus={isNew}
          />
          {errors.title ? (
            <Text style={[styles.errorText, { color: errorColor }]}>{errors.title}</Text>
          ) : null}
        </View>

        {/* 分类选择 */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: subColor }]}>分类</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory.id === cat.id ? cat.color : inputBg,
                    borderColor: cat.color,
                  },
                ]}
                onPress={() => selectCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: selectedCategory.id === cat.id ? '#FFFFFF' : cat.color,
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 开始时间 */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: subColor }]}>开始时间 *</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateBtn, { backgroundColor: inputBg, borderColor: borderColor }]}
            onPress={() => openDatePicker('start')}
          >
            <Text style={[styles.dateText, { color: inputTextColor }]}>
              {formatDateTime(startTime)}
            </Text>
            <Text style={[styles.dateIcon, { color: subColor }]}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* 结束时间 */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: subColor }]}>结束时间 *</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateBtn, { backgroundColor: inputBg, borderColor: errors.time ? errorColor : borderColor }]}
            onPress={() => openDatePicker('end')}
          >
            <Text style={[styles.dateText, { color: inputTextColor }]}>
              {formatDateTime(endTime)}
            </Text>
            <Text style={[styles.dateIcon, { color: subColor }]}>📅</Text>
          </TouchableOpacity>
          {errors.time ? (
            <Text style={[styles.errorText, { color: errorColor }]}>{errors.time}</Text>
          ) : null}
        </View>

        {/* 时长预览 */}
        <View style={[styles.durationPreview, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.durationLabel, { color: subColor }]}>预计时长</Text>
          <Text style={[styles.durationValue, { color: '#4A90D9' }]}>
            {(() => {
              const ms = endTime - startTime;
              if (ms <= 0) return '—';
              const totalMin = Math.floor(ms / 60000);
              const hours = Math.floor(totalMin / 60);
              const minutes = totalMin % 60;
              return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            })()}
          </Text>
        </View>

        {/* 备注 */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: subColor }]}>备注</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: inputBg, color: inputTextColor, borderColor },
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="备注信息（可选）"
            placeholderTextColor={subColor}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* 操作按钮 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {isNew ? '创建日志' : '保存修改'}
            </Text>
          </TouchableOpacity>

          {!isNew && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteBtnText}>删除此日志</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelBtnText, { color: subColor }]}>取消</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 日期时间选择器 */}
      {showPicker && (
        <View>
          {Platform.OS === 'ios' && (
            <View style={[styles.pickerHeader, { backgroundColor: cardBg }]}>
              <TouchableOpacity onPress={closeIOSPicker}>
                <Text style={[styles.pickerDone, { color: '#4A90D9' }]}>完成</Text>
              </TouchableOpacity>
            </View>
          )}
          <DateTimePicker
            value={pickerMode === 'start' ? new Date(startTime) : new Date(endTime)}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(2024, 0, 1)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
  },
  dateIcon: {
    fontSize: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  durationPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  durationLabel: {
    fontSize: 14,
  },
  durationValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 4,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: '#4A90D9',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  deleteBtnText: {
    color: '#E74C3C',
    fontSize: 15,
    fontWeight: '500',
  },
  cancelBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '600',
  },
});
