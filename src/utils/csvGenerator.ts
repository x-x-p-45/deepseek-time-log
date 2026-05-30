import { TimeLog } from '../types';

/**
 * CSV 字段列表（含 BOM 头，确保 Excel 直接打开不乱码）
 */
const CSV_HEADER = '﻿日志ID,标题,分类,开始时间,结束时间,总时长(秒),总时长(可读),备注,记录类型,来源页面';

/**
 * 将单条日志转换为 CSV 行
 */
function logToCSVRow(log: TimeLog): string {
  const escapeField = (value: string): string => {
    // 若字段含逗号、引号或换行，用引号包裹并转义内部引号
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const fields = [
    log.id,
    log.title,
    log.category.name,
    formatDateForCSV(log.startTime),
    formatDateForCSV(log.endTime),
    Math.floor(log.duration / 1000).toString(),
    formatDurationForCSV(log.duration),
    log.note,
    log.isAuto ? '自动记录' : '手动记录',
    log.sourcePage,
  ];

  return fields.map(escapeField).join(',');
}

function formatDateForCSV(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDurationForCSV(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * 将日志数组生成为 CSV 字符串
 */
export function generateCSV(logs: TimeLog[]): string {
  const rows = logs.map(logToCSVRow);
  return [CSV_HEADER, ...rows].join('\n');
}

/**
 * 生成带时间戳的文件名
 */
export function generateExportFileName(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `deepseek_time_log_${dateStr}.csv`;
}
