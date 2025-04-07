/**
 * 标签事件组合式函数
 *
 * 这个文件提供了使用标签事件的Vue组合式函数
 */
import { onMounted, onUnmounted } from 'vue'

import {
  TabEventType,
  addSpecificTabEventListener,
  addTabEventListener
} from '@/utils/tabEvents'

/**
 * 标签事件组合式函数
 *
 * @param options 配置选项
 * @returns 移除所有监听器的函数
 */
export function useTabEvents(options: {
  onAny?: (eventType: TabEventType, tabData: any) => void
  onAdd?: (tabData: any) => void
  onRemove?: (tabData: any) => void
  onSelect?: (tabData: any) => void
  onReorder?: (tabData: any) => void
}) {
  const listeners: (() => void)[] = []

  onMounted(() => {
    // 监听所有标签事件
    if (options.onAny) {
      listeners.push(
        addTabEventListener((eventType, tabData) => {
          options.onAny?.(eventType, tabData)
        })
      )
    }

    // 监听特定类型的标签事件
    if (options.onAdd) {
      listeners.push(
        addSpecificTabEventListener(TabEventType.Add, (tabData) => {
          options.onAdd?.(tabData)
        })
      )
    }

    if (options.onRemove) {
      listeners.push(
        addSpecificTabEventListener(TabEventType.Remove, (tabData) => {
          options.onRemove?.(tabData)
        })
      )
    }

    if (options.onSelect) {
      listeners.push(
        addSpecificTabEventListener(TabEventType.Select, (tabData) => {
          options.onSelect?.(tabData)
        })
      )
    }

    if (options.onReorder) {
      listeners.push(
        addSpecificTabEventListener(TabEventType.Reorder, (tabData) => {
          options.onReorder?.(tabData)
        })
      )
    }
  })

  // 在组件卸载时移除所有监听器
  onUnmounted(() => {
    listeners.forEach((removeListener) => removeListener())
  })

  // 返回手动移除所有监听器的函数
  return () => {
    listeners.forEach((removeListener) => removeListener())
    listeners.length = 0
  }
}

/**
 * 初始化调试监听器
 */
export function useTabEventDebugger() {
  return useTabEvents({
    onAny: (eventType, tabData) => {
      console.log(`[TabEventDebugger] 收到标签事件: ${eventType}`, tabData)
    }
  })
}
