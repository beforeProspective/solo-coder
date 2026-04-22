<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 class="text-2xl font-bold text-gray-800">📝 笔记墙</h1>
          <div class="flex items-center gap-3">
            <div class="relative flex-1 sm:flex-none">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索笔记..."
                class="w-full sm:w-64 px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button
              @click="openCreateDialog"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              新建笔记
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="displayNotes.length === 0 && !isDragging" class="text-center py-16">
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-medium text-gray-600 mb-2">
          {{ noteStore.notes.length === 0 ? '还没有笔记' : '没有找到匹配的笔记' }}
        </h3>
        <p class="text-gray-500">
          {{ noteStore.notes.length === 0 ? '点击"新建笔记"开始创建你的第一条笔记' : '尝试使用其他关键词搜索' }}
        </p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <template v-for="note in displayNotes" :key="note.id">
          <div
            v-if="isDragging && draggedNoteId === note.id"
            class="h-48 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 flex items-center justify-center"
          >
            <span class="text-blue-400 text-sm">拖拽中...</span>
          </div>

          <NoteCard
            v-else
            :note="note"
            :index="getOriginalIndex(note.id)"
            :is-dragging="isDragging"
            :dragged-note-id="draggedNoteId"
            @drag-start="onDragStart"
            @drag-end="onDragEnd"
            @drop-target="onDropTarget"
            @delete="onDelete"
            @edit="onEdit"
          />
        </template>
      </div>
    </main>

    <div
      v-if="showDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeDialog"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ isEditing ? '编辑笔记' : '新建笔记' }}
          </h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              v-model="formTitle"
              type="text"
              placeholder="输入标题..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              @keyup.enter="saveNote"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              v-model="formContent"
              placeholder="输入内容..."
              rows="5"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">背景色</label>
            <div class="flex space-x-3">
              <button
                v-for="color in colorOptions"
                :key="color"
                type="button"
                :class="[
                  'w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110',
                  NOTE_COLORS[color].bg,
                  NOTE_COLORS[color].border,
                  { 'ring-2 ring-gray-800 ring-offset-2': formColor === color }
                ]"
                @click="formColor = color"
              ></button>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            @click="closeDialog"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            @click="saveNote"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
          <p class="text-gray-600 mb-6">确定要删除这条笔记吗？此操作无法撤销。</p>
          <div class="flex justify-center space-x-3">
            <button
              type="button"
              @click="showDeleteConfirm = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              @click="confirmDelete"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNoteStore } from './stores/noteStore'
import NoteCard from './components/NoteCard.vue'
import type { Note, NoteColor } from './types'
import { NOTE_COLORS } from './types'

const noteStore = useNoteStore()
const searchQuery = ref('')

const showDialog = ref(false)
const isEditing = ref(false)
const editingNoteId = ref<string | null>(null)
const formTitle = ref('')
const formContent = ref('')
const formColor = ref<NoteColor>('yellow')

const showDeleteConfirm = ref(false)
const deletingNoteId = ref<string | null>(null)

const isDragging = ref(false)
const draggedNoteId = ref<string | null>(null)

const colorOptions: NoteColor[] = ['yellow', 'green', 'blue', 'pink']

const displayNotes = computed(() => noteStore.filteredNotes)

watch(searchQuery, (newValue) => {
  noteStore.setSearchQuery(newValue)
})

function getOriginalIndex(id: string): number {
  return noteStore.notes.findIndex(n => n.id === id)
}

function openCreateDialog() {
  isEditing.value = false
  editingNoteId.value = null
  formTitle.value = ''
  formContent.value = ''
  formColor.value = colorOptions[Math.floor(Math.random() * colorOptions.length)]
  showDialog.value = true
}

function onEdit(note: Note) {
  isEditing.value = true
  editingNoteId.value = note.id
  formTitle.value = note.title
  formContent.value = note.content
  formColor.value = note.backgroundColor
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  isEditing.value = false
  editingNoteId.value = null
  formTitle.value = ''
  formContent.value = ''
  formColor.value = 'yellow'
}

async function saveNote() {
  if (isEditing.value && editingNoteId.value) {
    await noteStore.updateNoteById(editingNoteId.value, {
      title: formTitle.value,
      content: formContent.value,
      backgroundColor: formColor.value
    })
  } else {
    await noteStore.createNote(formTitle.value, formContent.value, formColor.value)
  }
  closeDialog()
}

function onDelete(id: string) {
  deletingNoteId.value = id
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (deletingNoteId.value) {
    noteStore.removeNote(deletingNoteId.value)
  }
  showDeleteConfirm.value = false
  deletingNoteId.value = null
}

function onDragStart(noteId: string) {
  isDragging.value = true
  draggedNoteId.value = noteId
}

function onDragEnd() {
  isDragging.value = false
  draggedNoteId.value = null
}

function onDropTarget(targetNoteId: string) {
  if (!draggedNoteId.value || draggedNoteId.value === targetNoteId) {
    onDragEnd()
    return
  }

  const fromIndex = noteStore.notes.findIndex(n => n.id === draggedNoteId.value)
  const toIndex = noteStore.notes.findIndex(n => n.id === targetNoteId)

  if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
    noteStore.swapNotes(fromIndex, toIndex)
  }

  onDragEnd()
}

onMounted(async () => {
  await noteStore.loadNotes()
})
</script>
