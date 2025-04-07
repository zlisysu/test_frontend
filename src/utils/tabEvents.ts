/**
 * 标签事件处理工具 - 提供标签事件分发的方法
 * 用于在ComfyUI的标签操作时触发自定义事件，以便外部代码能够监听
 */

/**
 * 标签事件类型
 */
export enum TabEventType {
  Add = 'add',
  Remove = 'remove',
  Select = 'select',
  Reorder = 'reorder'
}

/**
 * 分发标签事件
 * @param eventType 事件类型
 * @param tabData 标签数据
 */
export function dispatchTabEvent(eventType: TabEventType, tabData: any) {
  // 创建自定义事件
  const event = new CustomEvent('comfyui_tab_event', {
    detail: {
      eventType,
      tabData
    },
    bubbles: true,
    cancelable: true
  })

  // 在document上分发事件，这样任何地方都可以监听
  document.dispatchEvent(event)

  // 同时分发一个特定类型的事件
  const specificEvent = new CustomEvent(`comfyui_tab_${eventType}`, {
    detail: tabData,
    bubbles: true,
    cancelable: true
  })
  document.dispatchEvent(specificEvent)

  // 输出日志以便调试
  console.debug(`[TabEvents] 分发标签事件: ${eventType}`, tabData)
}

/**
 * 添加标签事件监听器
 * @param callback 回调函数，接收事件类型和标签数据
 * @returns 一个函数，调用它可以移除监听器
 */
export function addTabEventListener(
  callback: (eventType: TabEventType, tabData: any) => void
) {
  const handler = (event: CustomEvent) => {
    callback(event.detail.eventType, event.detail.tabData)
  }

  // 监听通用事件
  document.addEventListener('comfyui_tab_event', handler as EventListener)

  // 返回移除监听器的函数
  return () => {
    document.removeEventListener('comfyui_tab_event', handler as EventListener)
  }
}

/**
 * 添加特定类型的标签事件监听器
 * @param eventType 事件类型
 * @param callback 回调函数，接收标签数据
 * @returns 一个函数，调用它可以移除监听器
 */
export function addSpecificTabEventListener(
  eventType: TabEventType,
  callback: (tabData: any) => void
) {
  const handler = (event: CustomEvent) => {
    callback(event.detail)
  }

  // 监听特定类型的事件
  document.addEventListener(
    `comfyui_tab_${eventType}`,
    handler as EventListener
  )

  // 返回移除监听器的函数
  return () => {
    document.removeEventListener(
      `comfyui_tab_${eventType}`,
      handler as EventListener
    )
  }
}
