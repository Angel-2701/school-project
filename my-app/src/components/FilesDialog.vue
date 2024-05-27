<template>
  <v-dialog v-model="dialogVisible" max-width="600">
    <v-card>
      <v-card-title>
        <span class="headline">{{ title }}</span>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <div class="flex-column">
          <div class="flex-item">
            <div v-if="seguimientos.length > 0">
              <h3>Seguimientos</h3>
              <v-list>
                <v-list-item
                  v-for="(seguimiento, index) in seguimientos"
                  :key="seguimiento._id"
                >
                  <v-list-item-icon>
                    <v-icon>mdi-file-pdf</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{
                      seguimientoLabels[index]
                    }}</v-list-item-title>
                    <v-list-item-title>{{
                      seguimiento.filename
                    }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      :href="
                        'data:application/octet-stream;base64,' +
                        seguimiento.data
                      "
                      :download="seguimiento.filename"
                      color="blue darken-2"
                      block
                      small
                    >
                      Descargar
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>
            <div v-else>
              <h3>No hay seguimientos</h3>
            </div>
          </div>

          <div class="flex-row">
            <div class="flex-item">
              <div v-if="Object.keys(archivos).length > 0">
                <h3>Archivos</h3>
                <v-list>
                  <v-list-item
                    v-for="(fileId, fileName) in archivos"
                    :key="fileId"
                  >
                    <v-list-item-icon>
                      <v-icon>mdi-file-pdf</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ fileName }}</v-list-item-title>
                      <v-list-item-title v-if="archivosDetails[fileId]">{{
                        archivosDetails[fileId].filename
                      }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn
                        :href="
                          'data:application/octet-stream;base64,' +
                          getArchivoData(fileId)
                        "
                        :download="
                          archivosDetails[fileId]
                            ? archivosDetails[fileId].filename
                            : ''
                        "
                        color="blue darken-2"
                        block
                        small
                      >
                        Descargar
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else>
                <h3>No hay archivos</h3>
              </div>
            </div>

            <div class="flex-item">
              <div v-if="asesorias.length > 0">
                <h3>Asesorias</h3>
                <v-list>
                  <v-list-item
                    v-for="asesoria in asesorias"
                    :key="asesoria._id"
                  >
                    <v-list-item-icon>
                      <v-icon>mdi-file-pdf</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{
                        asesoria.filename
                      }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn
                        :href="
                          'data:application/octet-stream;base64,' +
                          asesoria.data
                        "
                        :download="asesoria.filename"
                        color="blue darken-2"
                        block
                        small
                      >
                        Descargar
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else>
                <h3>No hay asesorías</h3>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-2" text @click="closeDialog">Cerrar</v-btn>
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
      default: 'Documentos'
    }
  },
  data () {
    return {
      seguimientoLabels: [
        'Seguimiento 1',
        'Seguimiento 2',
        'Seguimiento 3'
        // Add more seguimiento labels as needed
      ],
      seguimientos: [],
      asesorias: [],
      archivos: {},
      archivosDetails: {}
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
    async loadFiles () {
      await this.loadSeguimientos()
      await this.loadAsesorias()
      await this.loadArchivos()
    },
    async loadSeguimientos () {
      const seguimientoIds = [
        this.student.seguimiento1,
        this.student.seguimiento2,
        this.student.seguimiento3
      ]

      // Iterate over seguimientoIds to remove labels for null seguimientos
      seguimientoIds.forEach((id, index) => {
        if (id === null) {
          // Use splice to delete the element at the current index
          this.seguimientoLabels.splice(index, 1)
        }
      })

      // Filter out null seguimiento IDs
      const nonNullSeguimientoIds = seguimientoIds.filter((id) => id !== null)

      this.seguimientos = await this.fetchFiles(
        'uploads',
        nonNullSeguimientoIds
      )
    },

    async loadAsesorias () {
      const asesoriaIds = this.student.archivosAsesorias || []
      this.asesorias =
        asesoriaIds.length > 0
          ? await this.fetchFiles('asesoria', asesoriaIds)
          : []
    },
    async loadArchivos () {
      const archivos = this.student.archivos || {}
      const archivoIds = Object.values(archivos)
      this.archivos = archivos
      const fetchedFiles = await this.fetchFiles('archivo', archivoIds)
      const archivosDetails = {}
      fetchedFiles.forEach((file) => {
        archivosDetails[file._id] = file
      })
      this.archivosDetails = archivosDetails
    },

    closeDialog () {
      this.dialogVisible = false
    },
    async fetchFiles (collection, fileIds) {
      try {
        const files = await Promise.all(
          fileIds.map(async (fileId) => {
            const response = await fetch(
              `http://localhost:3000/files/${collection}/${fileId}`
            )
            if (!response.ok) {
              throw new Error(`Failed to fetch file with ID ${fileId}`)
            }
            const fileData = await response.json()
            return {
              _id: fileId,
              filename: fileData.filename,
              data: fileData.data
            }
          })
        )
        return files
      } catch (error) {
        console.error('Error fetching files:', error)
        return []
      }
    },
    getArchivoData (fileId) {
      const file = this.archivosDetails[fileId]
      return file ? file.data : ''
    }
  }
}
</script>

<style scoped>
.headline {
  font-weight: bold;
}
.v-list-item-title {
  cursor: pointer;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.flex-item {
  flex: 1;
  margin: 0 10px;
}
</style>
