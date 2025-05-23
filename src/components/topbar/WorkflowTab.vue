<template>
  <div class="flex p-2 gap-2 workflow-tab" ref="workflowTabRef" v-bind="$attrs">
    <span
      class="workflow-label text-sm max-w-[150px] truncate inline-block"
      v-tooltip.bottom="workflowOption.workflow.key"
    >
      {{ workflowOption.workflow.filename }}
    </span>
    <div class="relative">
      <span
        class="status-indicator"
        v-if="
          !workspaceStore.shiftDown &&
          (workflowOption.workflow.isModified ||
            !workflowOption.workflow.isPersisted)
        "
        >•</span
      >
      <Button
        class="close-button p-0 w-auto"
        icon="pi pi-times"
        text
        severity="secondary"
        size="small"
        @click.stop="onCloseWorkflow(workflowOption)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  usePragmaticDraggable,
  usePragmaticDroppable
} from '@/composables/usePragmaticDragAndDrop'
import { useWorkflowService } from '@/services/workflowService'
import { ComfyWorkflow } from '@/stores/workflowStore'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { TabEventType, dispatchTabEvent } from '@/utils/tabEvents'

interface WorkflowOption {
  value: string
  workflow: ComfyWorkflow
}

const props = defineProps<{
  class?: string
  workflowOption: WorkflowOption
}>()

const { t } = useI18n()

const workspaceStore = useWorkspaceStore()
const workflowStore = useWorkflowStore()
const workflowTabRef = ref<HTMLElement | null>(null)

const closeWorkflows = async (options: WorkflowOption[]) => {
  for (const opt of options) {
    dispatchTabEvent(TabEventType.Remove, {
      id: opt.workflow.key,
      path: opt.workflow.path,
      filename: opt.workflow.filename
    })

    if (
      !(await useWorkflowService().closeWorkflow(opt.workflow, {
        warnIfUnsaved: !workspaceStore.shiftDown,
        hint: t('sideToolbar.workflowTab.dirtyCloseHint')
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
const tabGetter = () => workflowTabRef.value as HTMLElement

usePragmaticDraggable(tabGetter, {
  getInitialData: () => {
    return {
      workflowKey: props.workflowOption.workflow.key
    }
  }
})

usePragmaticDroppable(tabGetter, {
  getData: () => {
    return {
      workflowKey: props.workflowOption.workflow.key
    }
  },
  onDrop: (e) => {
    const fromIndex = workflowStore.openWorkflows.findIndex(
      (wf) => wf.key === e.source.data.workflowKey
    )
    const toIndex = workflowStore.openWorkflows.findIndex(
      (wf) => wf.key === e.location.current.dropTargets[0]?.data.workflowKey
    )
    if (fromIndex !== toIndex) {
      dispatchTabEvent(TabEventType.Reorder, {
        fromIndex,
        toIndex,
        tabs: workflowStore.openWorkflows.map((wf) => ({
          id: wf.key,
          path: wf.path,
          filename: wf.filename
        }))
      })

      workflowStore.reorderWorkflows(fromIndex, toIndex)
    }
  }
})
</script>

<style scoped>
.status-indicator {
  @apply absolute font-bold;
  font-size: 1.5rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
