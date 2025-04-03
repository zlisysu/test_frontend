<template>
  <div>
    <!--
    UnloadWindowConfirmDialog: This component does not render
    anything visible. It is used to confirm the user wants to
    close the window, and if they do, it will call the
    beforeunload event.
    -->
  </div>
</template>

<script setup lang="ts">
// 注释掉未使用的import
// import { onBeforeUnmount, onMounted } from 'vue'

// 注释掉未使用的store imports
// import { useSettingStore } from '@/stores/settingStore'
// import { useWorkflowStore } from '@/stores/workflowStore'

// 注释掉未使用的store变量
// const settingStore = useSettingStore()
// const workflowStore = useWorkflowStore()

// 注释掉未使用的函数
// const handleBeforeUnload = (event: BeforeUnloadEvent) => {
//   if (
//     settingStore.get('Comfy.Window.UnloadConfirmation') &&
//     workflowStore.modifiedWorkflows.length > 0
//   ) {
//     event.preventDefault()
//     return true
//   }
//   return undefined
// }

// 注释掉事件监听器的添加
// onMounted(() => {
//   window.addEventListener('beforeunload', handleBeforeUnload)
// })

// 注释掉事件监听器的移除
// onBeforeUnmount(() => {
//   window.removeEventListener('beforeunload', handleBeforeUnload)
// })
</script>
