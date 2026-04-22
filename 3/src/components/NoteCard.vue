<template>
  <div
    class="group relative p-4 rounded-lg border-2 shadow-md transition-all duration-200 cursor-grab select-none"
    :class="[
      NOTE_COLORS[note.backgroundColor].bg,
      NOTE_COLORS[note.backgroundColor].border,
      {
        'ring-2 ring-blue-500 ring-offset-2': isDragOver,
        'opacity-40': isSourceCard,
        'cursor-grabbing shadow-xl scale-105 z-50': isDraggingSelf,
      }
    ]"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="flex items-start justify-between mb-2">
      <h3 class="font-bold text-lg truncate flex-1 mr-2" :title="note.title">
        {{ note.title || '无标题' }}
      </h3>
      <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          @click.stop="onEditClick"
          class="p-1.5 rounded hover:bg-white hover:bg-opacity-60 transition-colors"
          title="编辑"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </button>
        <button
          type="button"
          @click.stop="onDeleteClick"
          class="p-1.5 rounded hover:bg-red-100 transition-colors"
          title="删除"
        >
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>

    <p class="text-gray-700 text-sm mb-3 line-clamp-4">
      {{ note.content || '无内容' }}
    </p>

    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>{{ formattedDate }}</span>
      <div class="flex items-center text-gray-400">
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
        </svg>
        <span>拖拽排序</span>
      </div>
    </div>

    <div
      v-if="isDragOver && !isSourceCard"
      class="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none bg-blue-50 bg-opacity-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Note } from '../types'
import { NOTE_COLORS } from '../types'

const props = defineProps<{
  note: Note
  index: number
  isDragging?: boolean
  draggedNoteId?: string | null
}>()

const emit = defineEmits<{
  (e: 'drag-start', noteId: string): void
  (e: 'drag-end'): void
  (e: 'drop-target', targetNoteId: string): void
  (e: 'delete', id: string): void
  (e: 'edit', note: Note): void
}>()

const isDragOver = ref(false)

const isSourceCard = computed(() => props.draggedNoteId === props.note.id)
const isDraggingSelf = computed(() => props.isDragging && props.draggedNoteId === props.note.id)

const formattedDate = computed(() => {
  const date = new Date(props.note.createdAt)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

function onEditClick() {
  emit('edit', props.note)
}

function onDeleteClick() {
  emit('delete', props.note.id)
}

function onDragStart(event: DragEvent) {
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.note.id)
  }
  emit('drag-start', props.note.id)
}

function onDragEnd(event: DragEvent) {
  event.stopPropagation()
  isDragOver.value = false
  emit('drag-end')
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (props.draggedNoteId && props.draggedNoteId !== props.note.id) {
    isDragOver.value = true
  }
}

function onDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false

  if (props.draggedNoteId && props.draggedNoteId !== props.note.id) {
    emit('drop-target', props.note.id)
  }
}
</script>

<style scoped>
.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
