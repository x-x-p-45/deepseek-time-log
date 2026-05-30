import { v4 as uuidv4 } from 'uuid';

/**
 * 生成唯一 ID（UUID v4），纯 JS 实现，无原生依赖
 */
export function generateUUID(): string {
  return uuidv4();
}
