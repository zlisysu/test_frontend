/**
 * 标签事件监听演示
 *
 * 这个文件演示了如何监听标签事件，可以在浏览器控制台中引入并执行
 */
import {
  TabEventType,
  addSpecificTabEventListener,
  addTabEventListener
} from './tabEvents'

/**
 * 初始化标签事件监听演示
 */
export function initTabEventsDemo() {
  // 监听所有标签事件
  const removeAllListener = addTabEventListener((eventType, tabData) => {
    console.log(`[TabEventsDemo] 收到标签事件: ${eventType}`, tabData)
  })

  // 监听特定类型的标签事件
  const removeAddListener = addSpecificTabEventListener(
    TabEventType.Add,
    (tabData) => {
      console.log('[TabEventsDemo] 收到添加标签事件:', tabData)
    }
  )

  const removeRemoveListener = addSpecificTabEventListener(
    TabEventType.Remove,
    (tabData) => {
      console.log('[TabEventsDemo] 收到移除标签事件:', tabData)
    }
  )

  const removeSelectListener = addSpecificTabEventListener(
    TabEventType.Select,
    (tabData) => {
      console.log('[TabEventsDemo] 收到选择标签事件:', tabData)
    }
  )

  const removeReorderListener = addSpecificTabEventListener(
    TabEventType.Reorder,
    (tabData) => {
      console.log('[TabEventsDemo] 收到重排标签事件:', tabData)
    }
  )

  console.log('[TabEventsDemo] 标签事件监听器已初始化')

  // 返回移除所有监听器的函数
  return () => {
    removeAllListener()
    removeAddListener()
    removeRemoveListener()
    removeSelectListener()
    removeReorderListener()
    console.log('[TabEventsDemo] 所有标签事件监听器已移除')
  }
}

/**
 * 模拟触发标签事件的函数，用于测试
 */
export function simulateTabEvents() {
  import('./tabEvents').then(({ dispatchTabEvent, TabEventType }) => {
    // 模拟添加标签
    dispatchTabEvent(TabEventType.Add, {
      id: 'test_add',
      path: 'test/path.json',
      filename: 'test.json',
      isTemporary: true
    })

    // 模拟选择标签
    setTimeout(() => {
      dispatchTabEvent(TabEventType.Select, {
        id: 'test_select',
        path: 'test/select.json',
        filename: 'select.json'
      })
    }, 1000)

    // 模拟重排标签
    setTimeout(() => {
      dispatchTabEvent(TabEventType.Reorder, {
        fromIndex: 0,
        toIndex: 2,
        tabs: [
          { id: 'tab1', path: 'path1', filename: 'file1' },
          { id: 'tab2', path: 'path2', filename: 'file2' },
          { id: 'tab3', path: 'path3', filename: 'file3' }
        ]
      })
    }, 2000)

    // 模拟关闭标签
    setTimeout(() => {
      dispatchTabEvent(TabEventType.Remove, {
        id: 'test_remove',
        path: 'test/remove.json',
        filename: 'remove.json'
      })
    }, 3000)

    console.log('[TabEventsDemo] 已模拟触发标签事件，请查看控制台日志')
  })
}
