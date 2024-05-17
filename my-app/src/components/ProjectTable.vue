<template>
  <v-app>
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
          <!-- Students Data -->
          <v-data-table
            v-if="users.length > 0"
            :items="users"
            align="center"
            :search="search"
            items-per-page-text="Elementos por página"
            pageText=""
          >
            <template v-slot:top>
              <v-toolbar flat color="blue darken-2">
                <v-toolbar-title>{{ selectedProject.nombre }}</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <!-- Removed the button for creating a new project -->
              </v-toolbar>
            </template>
            <template v-slot:headers>
              <tr>
                <th>{{ "ID" }}</th>
                <th>{{ "Nombre" }}</th>
                <th>{{ "Apellido Paterno" }}</th>
                <th>{{ "Apellido Materno" }}</th>
                <th>{{ "Carrera" }}</th>
                <th>{{ "Proyecto" }}</th>
                <!-- Exclude numeroTelefonico from the headers -->
              </tr>
            </template>
            <template v-slot:item="{ item }">
              <tr @click="handleRowClick(item)" class="clickable-row">
                <td>{{ item._id }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ item.apellido }}</td>
                <td>{{ item.apellidoM }}</td>
                <td>{{ item.carrera }}</td>
                <td>{{ getProjectName(item.proyecto) }}</td>
                <td>
                  <!-- Use small prop to make the buttons smaller -->
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        small
                        color="blue darken-2"
                        @click="openGradeDialog(item, $event)"
                        style="width: 30px; height: 30px; margin-right: 5px"
                        v-on="on"
                      >
                        <v-icon style="font-size: 18px"
                          >mdi-clipboard-check-outline</v-icon
                        >
                      </v-btn>
                    </template>
                    <span>Asignar Calificaciones</span>
                  </v-tooltip>

                  <v-btn
                    icon
                    small
                    color="green darken-2"
                    @click="openConsultanciesDialog(item, $event)"
                    style="width: 30px; height: 30px; margin-right: 5px"
                  >
                    <v-icon style="font-size: 18px">mdi-check</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-main>

    <!-- Dialog for assigning grades -->
    <v-dialog v-model="editDialog" max-width="800">
      <v-card>
        <v-card-title class="headline">
          Asignar Calificaciones a {{ selectedUser.nombre }}
          {{ selectedUser.apellido }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="selectedUser.calificaciones.calificacion1"
                :items="gradeOptions"
                label="Calificación 1"
                type="number"
                :rules="[
                  (v) =>
                    (v >= 1 && v <= 100) || 'Debe ser un número entre 1 y 100',
                ]"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="selectedUser.calificaciones.calificacion2"
                :items="gradeOptions"
                label="Calificación 2"
                type="number"
                :rules="[
                  (v) =>
                    (v >= 1 && v <= 100) || 'Debe ser un número entre 1 y 100',
                ]"
              ></v-text-field>
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="selectedUser.calificaciones.calificacion3"
                :items="gradeOptions"
                label="Calificación 3"
                type="number"
                :rules="[
                  (v) =>
                    (v >= 1 && v <= 100) || 'Debe ser un número entre 1 y 100',
                ]"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="editDialog = false"
            >Cancelar</v-btn
          >
          <v-btn color="blue darken-1" text @click="saveGrades">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for enabling consultancies -->
    <v-dialog v-model="enableConsultanciesDialog" max-width="800">
      <v-card>
        <v-card-title class="headline">
          Habilitar Asesorías para {{ selectedStudent.nombre }}
          {{ selectedStudent.apellido }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedStudent.asesorias"
            label="Número de asesorías (Max: 16)"
            type="number"
            max="16"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="blue darken-1"
            text
            @click="enableConsultanciesDialog = false"
            >Cancelar</v-btn
          >
          <v-btn color="blue darken-1" text @click="enableConsultancies"
            >Habilitar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      id: localStorage.getItem('id'),
      userName: localStorage.getItem('userName'),
      editDialog: false,
      projects: [],
      students: [],
      users: [],
      drawer: false,
      selectedProject: null,
      selectedUser: {},
      gradeOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      enableConsultanciesDialog: false,
      sidebarItems: [{ title: 'Projects', icon: 'mdi-folder-outline' }],
      search: ''
    }
  },
  beforeRouteEnter (to, from, next) {
    const projectId = parseFloat(to.params.projectId)
    axios
      .get(`http://localhost:3000/projects/${projectId}`)
      .then((response) => next((vm) => (vm.selectedProject = response.data)))
      .catch((error) => {
        console.error('Error fetching user details:', error)
        next(false) // Prevent component from rendering
      })
  },

  methods: {
    async fetchData () {
      try {
        const [teacherResponse, studentsResponse, projectsResponse] =
          await Promise.all([
            axios.get(`http://localhost:3000/users/${this.id}`),
            axios.get('http://localhost:3000/students'),
            axios.get('http://localhost:3000/projects')
          ])

        const teacher = teacherResponse.data
        const allStudents = studentsResponse.data

        const teacherStudents = allStudents.filter((student) =>
          teacher.alumnos.includes(student._id)
        )
        const projectIds = teacherStudents.map((student) => student.proyecto)

        const projects = projectsResponse.data
        const filteredProjects = projects.filter((project) =>
          projectIds.includes(project._id)
        )

        this.projects = filteredProjects
        this.students = teacherStudents
        this.users = this.students.filter(
          (student) => student.proyecto === this.selectedProject._id
        )
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },

    openGradeDialog (user, event) {
      event.stopPropagation()
      this.selectedUser = user
      if (!this.selectedUser.calificaciones) {
        this.selectedUser.calificaciones = {
          calificacion1: null,
          calificacion2: null,
          calificacion3: null
        }
      }
      this.editDialog = true
    },

    async saveGrades () {
      try {
        const response = await axios.put(
          `http://localhost:3000/users/${this.selectedUser._id}`,
          this.selectedUser
        )
        console.log('User updated successfully:', response.data)
        this.editDialog = false
        this.fetchData()
      } catch (error) {
        console.error('Error updating user:', error)
      }
    },

    openConsultanciesDialog (student, event) {
      event.stopPropagation()
      this.selectedStudent = student
      this.enableConsultanciesDialog = true
    },
    enableConsultancies () {
      const numberOfConsultancies = parseInt(this.selectedStudent.asesorias)
      console.log('Number of Consultancies to Enable:', numberOfConsultancies)
      this.updateConsultancies(numberOfConsultancies)
    },
    async updateConsultancies () {
      try {
        const response = await axios.put(
          `http://localhost:3000/users/${this.selectedStudent._id}`,
          this.selectedStudent
        )
        console.log('User consultancies updated successfully:', response.data)
        this.enableConsultanciesDialog = false
        this.fetchData()
      } catch (error) {
        console.error('Error updating user consultancies:', error)
      }
    },

    navigate (index) {
      this.showProjects = true
      switch (index) {
        case 0:
          this.$router.push('/Teacher/Projects')
          break
        case 1:
          this.$router.push('/Students')
          break
        case 2:
          this.$router.push('/Teachers')
          break
        default:
          break
      }
    },
    logout () {
      localStorage.removeItem('token')
      this.$router.push('/login')
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
    getProjectName (projectId) {
      const project = this.projects.find((proj) => proj._id === projectId)
      return project ? project.nombre : 'Unknown'
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

<style scoped>
.clickable-row:hover {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
