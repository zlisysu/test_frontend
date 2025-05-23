<template>
  <div class="workflow-tabs-container flex flex-row max-w-full h-full">
    <ScrollPanel
      class="overflow-hidden no-drag"
      :pt:content="{
        class: 'p-0 w-full',
        onwheel: handleWheel
      }"
      pt:barX="h-1"
    >
      <SelectButton
        class="workflow-tabs bg-transparent"
        :class="props.class"
        :modelValue="selectedWorkflow"
        @update:modelValue="onWorkflowChange"
        :options="options"
        optionLabel="label"
        dataKey="value"
      >
        <template #option="{ option }">
          <WorkflowTab
            @contextmenu="showContextMenu($event, option)"
            @click.middle="onCloseWorkflow(option)"
            :workflow-option="option"
          />
        </template>
      </SelectButton>
    </ScrollPanel>
    <Button
      v-tooltip="{ value: $t('sideToolbar.newBlankWorkflow'), showDelay: 300 }"
      class="new-blank-workflow-button flex-shrink-0 no-drag"
      icon="pi pi-plus"
      text
      severity="secondary"
      :aria-label="$t('sideToolbar.newBlankWorkflow')"
      @click="onNewWorkflowClick"
    />
    <ContextMenu ref="menu" :model="contextMenuItems" />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import ContextMenu from 'primevue/contextmenu'
import ScrollPanel from 'primevue/scrollpanel'
import SelectButton from 'primevue/selectbutton'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import WorkflowTab from '@/components/topbar/WorkflowTab.vue'
import { useWorkflowService } from '@/services/workflowService'
import { useCommandStore } from '@/stores/commandStore'
import { ComfyWorkflow, useWorkflowBookmarkStore } from '@/stores/workflowStore'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { TabEventType, dispatchTabEvent } from '@/utils/tabEvents'

interface WorkflowOption {
  value: string
  workflow: ComfyWorkflow
}

const props = defineProps<{
  class?: string
}>()

const { t } = useI18n()
const workspaceStore = useWorkspaceStore()
const workflowStore = useWorkflowStore()
const workflowService = useWorkflowService()
const workflowBookmarkStore = useWorkflowBookmarkStore()
const rightClickedTab = ref<WorkflowOption | undefined>()
const menu = ref()

const workflowToOption = (workflow: ComfyWorkflow): WorkflowOption => ({
  value: workflow.path,
  workflow
})

const options = computed<WorkflowOption[]>(() =>
  workflowStore.openWorkflows.map(workflowToOption)
)
const selectedWorkflow = computed<WorkflowOption | null>(() =>
  workflowStore.activeWorkflow
    ? workflowToOption(workflowStore.activeWorkflow as ComfyWorkflow)
    : null
)
const onWorkflowChange = (option: WorkflowOption) => {
  // Prevent unselecting the current workflow
  if (!option) {
    return
  }
  // Prevent reloading the current workflow
  if (selectedWorkflow.value?.value === option.value) {
    return
  }

  // 分发标签选择事件
  dispatchTabEvent(TabEventType.Select, {
    id: option.workflow.key,
    path: option.workflow.path,
    filename: option.workflow.filename
  })

  workflowService.openWorkflow(option.workflow)
}

// 新建工作流按钮点击事件
const onNewWorkflowClick = () => {
  // 分发新建标签事件
  dispatchTabEvent(TabEventType.Add, {
    id: `new_${Date.now()}`,
    isTemporary: true
  })

  // 执行原有命令
  commandStore.execute('Comfy.NewBlankWorkflow')
}

const closeWorkflows = async (options: WorkflowOption[]) => {
  for (const opt of options) {
    if (
      !(await workflowService.closeWorkflow(opt.workflow, {
        warnIfUnsaved: !workspaceStore.shiftDown
      }))
    ) {
      // User clicked cancel
      break
    }
  }
}

const onCloseWorkflow = (option: WorkflowOption) => {
  closeWorkflows([option])
}

const showContextMenu = (event: MouseEvent, option: WorkflowOption) => {
  rightClickedTab.value = option
  menu.value.show(event)
}
const contextMenuItems = computed(() => {
  const tab = rightClickedTab.value as WorkflowOption
  if (!tab) return []
  const index = options.value.findIndex((v) => v.workflow === tab.workflow)

  return [
    {
      label: t('tabMenu.duplicateTab'),
      command: () => {
        workflowService.duplicateWorkflow(tab.workflow)
      }
    },
    {
      separator: true
    },
    {
      label: t('tabMenu.closeTab'),
      command: () => onCloseWorkflow(tab)
    },
    {
      label: t('tabMenu.closeTabsToLeft'),
      command: () => closeWorkflows(options.value.slice(0, index)),
      disabled: index <= 0
    },
    {
      label: t('tabMenu.closeTabsToRight'),
      command: () => closeWorkflows(options.value.slice(index + 1)),
      disabled: index === options.value.length - 1
    },
    {
      label: t('tabMenu.closeOtherTabs'),
      command: () =>
        closeWorkflows([
          ...options.value.slice(index + 1),
          ...options.value.slice(0, index)
        ]),
      disabled: options.value.length <= 1
    },
    {
      label: workflowBookmarkStore.isBookmarked(tab.workflow.path)
        ? t('tabMenu.removeFromBookmarks')
        : t('tabMenu.addToBookmarks'),
      command: () => workflowBookmarkStore.toggleBookmarked(tab.workflow.path),
      disabled: tab.workflow.isTemporary
    }
  ]
})
const commandStore = useCommandStore()

// Horizontal scroll on wheel
const handleWheel = (event: WheelEvent) => {
  const scrollElement = event.currentTarget as HTMLElement
  const scrollAmount = event.deltaX || event.deltaY
  scrollElement.scroll({
    left: scrollElement.scrollLeft + scrollAmount
  })
}
</script>

<style scoped>
:deep(.p-togglebutton) {
  @apply p-0 bg-transparent rounded-none flex-shrink-0 relative border-0 border-r border-solid;
  border-right-color: var(--border-color);
}

:deep(.p-togglebutton::before) {
  @apply hidden;
}

:deep(.p-togglebutton:first-child) {
  @apply border-l border-solid;
  border-left-color: var(--border-color);
}

:deep(.p-togglebutton:not(:first-child)) {
  @apply border-l-0;
}

:deep(.p-togglebutton.p-togglebutton-checked) {
  @apply border-b border-solid h-full;
  border-bottom-color: var(--p-button-text-primary-color);
}

:deep(.p-togglebutton:not(.p-togglebutton-checked)) {
  @apply opacity-75;
}

:deep(.p-togglebutton-checked) .close-button,
:deep(.p-togglebutton:hover) .close-button {
  @apply visible;
}

:deep(.p-togglebutton:hover) .status-indicator {
  @apply hidden;
}

:deep(.p-togglebutton) .close-button {
  @apply invisible;
}

:deep(.p-scrollpanel-content) {
  @apply h-full;
}

/* Scrollbar half opacity to avoid blocking the active tab bottom border */
:deep(.p-scrollpanel:hover .p-scrollpanel-bar),
:deep(.p-scrollpanel:active .p-scrollpanel-bar) {
  @apply opacity-50;
}

:deep(.p-selectbutton) {
  @apply rounded-none h-full;
}
</style>
