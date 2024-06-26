<template>
  <v-app>
    <v-container fluid>
      <!-- Top Bar -->
      <v-app-bar app color="blue darken-2" dark>
        <!-- Burger menu icon -->
        <v-btn icon @click="drawer = !drawer">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <!-- Title -->
        <v-toolbar-title>{{ userName }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- Logout button -->
        <v-btn icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>

      <!-- Sidebar -->
      <v-navigation-drawer app v-model="drawer" color="blue darken-2" dark>
        <v-list dense>
          <v-list-item
            v-for="(item, index) in sidebarItems"
            :key="index"
            @click="navigate(index)"
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <!-- Main content -->
        <v-col cols="12" style="max-width: 1500px; margin: 0px auto">
          <v-card class="text-center" style="width: 100%; margin: 0px auto">
            <template v-slot:text>
              <v-text-field
                v-model="search"
                label="Buscar"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                single-line
              ></v-text-field>
            </template>
            <!-- Teachers Data -->
            <v-data-table
              :items="teachers"
              align="center"
              :search="search"
              items-per-page-text="Elementos por página"
              pageText=""
            >
              <template v-slot:top>
                <v-toolbar flat color="blue darken-2">
                  <v-toolbar-title>Maestros</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn icon color="blue darken-2" @click="openCreateDialog">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>
              </template>
              <template v-slot:headers>
                <tr>
                  <th>{{ "ID" }}</th>
                  <th>{{ "Correo" }}</th>
                  <th>{{ "Nombre" }}</th>
                  <th>{{ "Apellido Paterno" }}</th>
                  <th>{{ "Apellido Materno" }}</th>
                  <th>{{ "Alumnos" }}</th>
                  <!-- Exclude numeroTelefonico from the headers -->
                </tr>
              </template>
              <template v-slot:item="{ item }">
                <tr @click="handleRowClick(item)" class="clickable-row">
                  <td>{{ item._id }}</td>
                  <td>{{ item.correo }}</td>
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.apellido }}</td>
                  <td>{{ item.apellidoM }}</td>
                  <td>
                    <v-btn
                      small
                      color="blue darken-2"
                      @click="showAssignedStudents(item, $event)"
                    >
                      {{ item.alumnos.length }} Alumnos
                    </v-btn>
                  </td>
                  <td>
                    <v-btn
                      icon
                      small
                      color="blue darken-2"
                      @click="editUser(item, $event)"
                      style="width: 30px; height: 30px; margin-right: 5px"
                    >
                      <v-icon style="font-size: 18px">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      small
                      color="red darken-2"
                      @click="deleteTeacher(item._id, $event)"
                      style="width: 30px; height: 30px; margin-right: 5px"
                    >
                      <v-icon style="font-size: 18px">mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-main>
      <!-- Show Assigned Students Dialog -->
      <v-dialog v-model="showAssignedStudentsDialog" max-width="500">
        <v-card>
          <v-card-title class="headline">Alumnos Asignados</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="student in assignedStudents"
                :key="student.id"
                class="mb-4"
                @click="openFilesDialog(student)"
              >
                <v-list-item-icon>
                  <v-icon>mdi-account</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">
                    <span>ID:</span> {{ student._id }}<br />
                    <span>Nombre:</span> {{ student.nombre }}<br />
                    <span>Proyecto:</span> {{ student.projectName }}

                    <!-- Modified to call getProjectName method -->
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="blue darken-2"
              dark
              large
              @click="showAssignedStudentsDialog = false"
              >Cerrar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Dialog -->
      <v-dialog v-model="editDialog" max-width="500" ref="editDialogForm">
        <v-card>
          <v-card-title>Editar Maestro</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="teacher.nombre"
              label="Nombre"
              required
              :rules="[(v) => !!v || 'Nombre requerido']"
            ></v-text-field>
            <v-text-field
              v-model="teacher.apellido"
              label="Apellido Paterno"
              required
              :rules="[(v) => !!v || 'Apellido Paterno requerido']"
            ></v-text-field>
            <v-text-field
              v-model="teacher.apellidoM"
              label="Apellido Materno"
              required
              :rules="[(v) => !!v || 'Apellido Materno requerido']"
            ></v-text-field>
            <v-text-field
              v-model="teacher.numeroTelefonico"
              label="Número Telefónico"
              type="number"
              required
              :rules="[(v) => !!v || 'Número Telefónico requerido']"
            ></v-text-field>
            <!-- Add v-select to select students -->
            <v-select
              v-model="teacher.alumnos"
              :items="students"
              label="Selecciona alumnos (max 5)"
              multiple
              chips
              required
              :rules="[(v) => !!v || 'Alumnos son requeridos']"
              @update:modelValue="limitSelection(false)"
            ></v-select>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="blue darken-2"
              @click="saveEditedTeacher"
              :disabled="!isEditFormValid"
              >Guardar</v-btn
            >
            <v-btn @click="cancelEdit">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create Dialog -->
      <v-dialog v-model="createDialog" max-width="500" ref="createDialogForm">
        <v-card>
          <v-card-title>Crear Nuevo Maestro</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="teacher._id"
              label="ID"
              required
              :rules="[
                (v) => {
                  console.log('ID value:', v);
                  return !!v || 'ID is required';
                },
                (v) => {
                  const isValid = /^[0-9]+$/.test(v);
                  console.log('Is ID valid?', isValid);
                  return isValid || 'ID must contain only numbers';
                },
              ]"
            ></v-text-field>
            <v-text-field
              v-model="teacher.nombre"
              label="Nombre"
              required
              :rules="[(v) => !!v || 'Nombre requerido']"
            ></v-text-field>
            <v-text-field
              v-model="teacher.apellido"
              label="Apellido Paterno"
              required
              :rules="[(v) => !!v || 'Apellido Paterno requerido']"
            ></v-text-field>
            <v-text-field
              v-model="teacher.apellidoM"
              label="Apellido Materno"
              required
              :rules="[(v) => !!v || 'Apellido Materno requerido']"
            ></v-text-field>
            <v-text-field
              v-model="teacher.numeroTelefonico"
              label="Número Telefónico"
              type="number"
              required
              :rules="[(v) => !!v || 'Número Telefónico requerido']"
            ></v-text-field>
            <v-text-field
              v-model="teacher.correo"
              label="Correo Electrónico"
              required
              :rules="[
                (v) => !!v || 'Correo requerido',
                (v) => /.+@.+\..+/.test(v) || 'Correo debe ser válido',
              ]"
            ></v-text-field>
            <v-text-field
              v-model="teacher.contraseña"
              label="Contraseña"
              type="password"
              required
              :rules="[(v) => !!v || 'Contraseña requerida']"
            ></v-text-field>
            <div>
              <v-select
                v-model="teacher.alumnos"
                :items="students"
                label="Selecciona alumnos (max 5)"
                multiple
                chips
                required
                :rules="[(v) => !!v || 'Alumnos requeridos']"
                @update:modelValue="limitSelection(true)"
              ></v-select>
            </div>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="blue darken-2"
              @click="saveNewTeacher"
              :disabled="!isCreateFormValid"
              >Guardar</v-btn
            >
            <v-btn @click="cancelCreate">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <FilesDialog
        :isOpen="showFilesDialog"
        :student="selectedStudent"
        @update:isOpen="showFilesDialog = $event"
      />
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios'
import FilesDialog from './FilesDialog.vue'

export default {
  components: {
    FilesDialog
  },
  data () {
    return {
      selectedStudent: null,
      showFilesDialog: false,
      studentProjectNames: {},
      students: [],
      selectedOptions: [],
      teachers: [],
      sidebarItems: [
        { title: 'Proyectos', icon: 'mdi-folder-outline' },
        { title: 'Alumnos', icon: 'mdi-account-plus-outline' },
        { title: 'Maestros', icon: 'mdi-account-tie' }
      ],
      userName: localStorage.getItem('userName'),
      drawer: false,
      editDialog: false,
      teacher: {
        _id: '',
        nombre: '',
        apellido: '',
        correo: '',
        contraseña: '',
        alumnos: [],
        apellidoM: '',
        numeroTelefonico: ''
        // Add more fields as needed
      },
      createDialog: false,
      showAssignedStudentsDialog: false,
      assignedStudents: [],
      search: ''
    }
  },
  computed: {
    isCreateFormValid () {
      // Check if the form reference exists
      if (!this.$refs.editDialogForm) {
        return false
      }

      // Manually validate each field
      return (
        this.teacher._id &&
        this.teacher.contraseña &&
        this.teacher.nombre &&
        this.teacher.apellido &&
        this.teacher.apellidoM &&
        this.teacher.numeroTelefonico &&
        this.teacher.correo &&
        this.teacher.alumnos
      )
    },
    isEditFormValid () {
      // Check if the form reference exists
      if (!this.$refs.editDialogForm) {
        return false
      }

      // Manually validate each field
      return (
        this.teacher.nombre &&
        this.teacher.apellido &&
        this.teacher.apellidoM &&
        this.teacher.numeroTelefonico &&
        this.teacher.alumnos
      )
    }
  },
  methods: {
    openFilesDialog (student) {
      this.selectedStudent = student
      this.showFilesDialog = true // Open the dialog with the student's files
    },
    limitSelection (isNewUser) {
      if (isNewUser && this.teacher.alumnos.length > 5) {
        alert('You can only select a maximum of 5 options.')
        this.teacher.alumnos = this.teacher.alumnos.slice(0, 5)
      } else if (!isNewUser && this.teacher.alumnos.length > 5) {
        alert('You can only select a maximum of 5 options.')
        this.teacher.alumnos = this.teacher.alumnos.slice(0, 5)
      }
    },
    async fetchData () {
      try {
        const response = await axios.get('http://localhost:3000/teachers')
        this.teachers = response.data.reverse()
      } catch (error) {
        console.error('Error fetching teachers:', error)
      }
    },

    async fetchStudents () {
      try {
        const studentsResponse = await axios.get(
          'http://localhost:3000/students'
        )
        const allStudents = studentsResponse.data

        // Filter out students who are not assigned to any teacher
        const unassignedStudents = allStudents.filter((student) => {
          return !this.teachers.some((teacher) =>
            teacher.alumnos.includes(student._id)
          )
        })

        const assignedStudents = allStudents.filter((student) => {
          return this.teachers.some((teacher) =>
            teacher.alumnos.includes(student._id)
          )
        })

        // Include the teacher's ID in the assignedStudents array
        const updatedAssignedStudents = assignedStudents.map((student) => ({
          ...student,
          teacherId: student.teacherId // Ensure each student object has a teacherId property
        }))

        // Fetch project names for each student's project
        const projectNamesPromises = updatedAssignedStudents.map(
          async (student) => {
            const projectName = await this.getProjectName(student.proyecto)
            return { ...student, projectName }
          }
        )

        // Wait for all project names to be fetched
        this.assignedStudents = await Promise.all(projectNamesPromises)

        // Extract just the names from the unassigned students data
        this.students = unassignedStudents.map((student) => student._id)
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    },

    async showAssignedStudents (teacher, event) {
      event.stopPropagation()
      // Filter assignedStudents to include only those assigned to the current teacher
      await this.fetchStudents()
      this.assignedStudents = this.assignedStudents.filter((student) =>
        teacher.alumnos.includes(student._id)
      )
      this.showAssignedStudentsDialog = true
    },

    async navigate (index) {
      switch (index) {
        case 0:
          this.$router.push('/admin')
          break
        case 1:
          this.$router.push('/admin/students')
          break
        case 2:
          this.$router.push('/admin/teachers')
          break
        default:
          break
      }
    },
    logout () {
      // Logic to logout the user
      // For example, you can clear any user data or tokens stored in localStorage
      localStorage.removeItem('token')

      // Redirect the user to the login page
      this.$router.push('/login')
    },
    async editUser (teacher, event) {
      event.stopPropagation()
      // Assign the teacher data to editedTeacher
      await this.fetchStudents()
      this.teacher = { ...teacher }

      // If editedTeacher has alumnos property, add its students to the students array
      if (this.teacher.alumnos && Array.isArray(this.teacher.alumnos)) {
        this.students = [...this.students, ...this.teacher.alumnos]
      }

      // Open the edit dialog
      this.editDialog = true
    },

    async saveEditedTeacher () {
      try {
        // Send the updated teacher data to the server
        const response = await axios.put(
          `http://localhost:3000/users/${this.teacher._id}`,
          this.teacher
        )

        console.log('Teacher updated successfully:', response.data)
        this.fetchData()
      } catch (error) {
        console.error('Error updating teacher:', error)
      }
      this.editDialog = false
    },

    cancelEdit () {
      this.editDialog = false
    },
    openCreateDialog () {
      this.resetTeacher()
      this.createDialog = true
      this.fetchStudents()
    },
    async saveNewTeacher () {
      try {
        // Add 'rol' field with value 'teacher'
        this.teacher.rol = 'teacher'

        const response = await axios.post(
          'http://localhost:3000/register',
          this.teacher
        )
        if (response.status === 201) {
          console.log('Teacher created successfully:', response.data)
          this.fetchData()
        } else {
          console.error('Failed to create teacher:', response.data)
        }
      } catch (error) {
        if (error.response) {
          // Display an error message to the user if the email already exists
          alert(error.response.data.error)
        }
      }
      this.createDialog = false
    },

    cancelCreate () {
      this.createDialog = false
    },
    async deleteTeacher (teacherId, event) {
      event.stopPropagation()
      if (confirm('¿Estás seguro que deseas borrar este maestro?')) {
        try {
          const response = await axios.delete(
            `http://localhost:3000/users/${teacherId}`
          )
          console.log('Teacher deleted successfully:', response.data)
          this.fetchData() // Call a method to update the UI or fetch updated data
        } catch (error) {
          console.error('Error deleting teacher:', error)
        }
      }
    },

    async getProjectName (projectId) {
      try {
        const response = await axios.get(
          `http://localhost:3000/projects/${projectId}`
        )
        const data = response.data // Assuming the project name is stored in the 'name' field
        return data.nombre
      } catch (error) {
        console.error('Error fetching project name:', error)
        return 'Unknown' // Return a default value if an error occurs
      }
    },
    async renderProjectName (projectId) {
      const projectName = await this.getProjectName(projectId)
      this.studentProjectNames[projectId] = projectName // Store the project name
    },

    handleRowClick (item) {
      // Handle row click event here
      console.log('Row clicked:', item)
      // Navigate to a new page and pass the user's ID as route parameters
      this.$router.push({
        name: 'UserDetails',
        params: { userId: item._id }
      })
    },

    resetTeacher () {
      this.teacher = {
        _id: '',
        nombre: '',
        apellido: '',
        correo: '',
        contraseña: '',
        alumnos: [],
        apellidoM: '',
        numeroTelefonico: ''
      }
    }
  },
  mounted () {
    this.fetchData()
    this.fetchStudents()
  }
}
</script>

<style scoped>
.v-btn i {
  color: white;
}

.clickable-row:hover {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
