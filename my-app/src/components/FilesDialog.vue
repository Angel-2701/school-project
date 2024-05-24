<template>
    <v-dialog v-model="dialogVisible" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">{{ title }}</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text v-if="files.length > 0">
          <v-list>
            <v-list-item v-for="file in files" :key="file._id">
              <v-list-item-icon>
                <v-icon>mdi-file-pdf</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ file.filename }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  :href="'data:application/pdf;base64,' + file.data"
                  :download="file.filename"
                  color="blue darken-2"
                  block
                >
                  Descargar
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-2" text @click="closeDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>

<script>
export default {
  name: 'FilesDialog',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    student: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      default: 'Dialog'
    }
  },
  data () {
    return {
      files: []
    }
  },
  computed: {
    dialogVisible: {
      get () {
        return this.isOpen
      },
      set (value) {
        this.$emit('update:isOpen', value)
      }
    }
  },
  watch: {
    dialogVisible (newVal) {
      if (newVal) {
        this.loadFiles()
      }
    }
  },
  methods: {
    loadFiles () {
      if (this.student && this.student.seguimiento1 && this.student.seguimiento2 && this.student.seguimiento3) {
        this.fetchFiles([this.student.seguimiento1, this.student.seguimiento2, this.student.seguimiento3])
      }
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async fetchFiles (fileIds) {
      try {
        const files = await Promise.all(
          fileIds.map(async (fileId) => {
            const response = await fetch(`http://localhost:3000/files/${fileId}`)
            if (!response.ok) {
              throw new Error(`Failed to fetch file with ID ${fileId}`)
            }
            const blob = await response.blob()
            const base64Data = await this.blobToBase64(blob)
            const contentDisposition = response.headers.get('Content-Disposition')

            let filename = 'unknown'
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
              if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1].replace(/['"]/g, '')
              }
            }

            return {
              _id: fileId,
              filename,
              data: base64Data
            }
          })
        )
        this.files = files
      } catch (error) {
        console.error('Error fetching files:', error)
      }
    },
    async blobToBase64 (blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }
  }
}
</script>

  <style scoped>
  .headline {
    font-weight: bold;
  }
  </style>
