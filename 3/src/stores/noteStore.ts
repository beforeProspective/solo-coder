import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note, NoteColor } from '../types'
import { getAllNotes, addNote, updateNote, deleteNote, updateNotesPositions } from '../lib/indexedDB'

export const useNoteStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const searchQuery = ref('')

  const filteredNotes = computed(() => {
    if (!searchQuery.value.trim()) {
      return notes.value
    }
    const query = searchQuery.value.toLowerCase()
    return notes.value.filter(
      note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    )
  })

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  async function loadNotes() {
    notes.value = await getAllNotes()
  }

  async function createNote(title: string = '', content: string = '', backgroundColor: NoteColor = 'yellow') {
    const note: Note = {
      id: generateId(),
      title,
      content,
      createdAt: Date.now(),
      backgroundColor,
      position: notes.value.length,
    }
    notes.value.push(note)
    await addNote(note)
    return note
  }

  async function updateNoteById(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) {
    const noteIndex = notes.value.findIndex(n => n.id === id)
    if (noteIndex === -1) return

    notes.value[noteIndex] = { ...notes.value[noteIndex], ...updates }
    await updateNote(notes.value[noteIndex])
  }

  async function removeNote(id: string) {
    const noteIndex = notes.value.findIndex(n => n.id === id)
    if (noteIndex === -1) return

    notes.value.splice(noteIndex, 1)
    await deleteNote(id)

    for (let i = noteIndex; i < notes.value.length; i++) {
      notes.value[i].position = i
      await updateNote(notes.value[i])
    }
  }

  async function swapNotes(index1: number, index2: number) {
    if (index1 < 0 || index1 >= notes.value.length || index2 < 0 || index2 >= notes.value.length) {
      return
    }

    const tempPos = notes.value[index1].position
    notes.value[index1].position = notes.value[index2].position
    notes.value[index2].position = tempPos

    const tempNote = notes.value[index1]
    notes.value[index1] = notes.value[index2]
    notes.value[index2] = tempNote

    await updateNotesPositions([notes.value[index1], notes.value[index2]])
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  return {
    notes,
    filteredNotes,
    searchQuery,
    loadNotes,
    createNote,
    updateNoteById,
    removeNote,
    swapNotes,
    setSearchQuery,
  }
})
