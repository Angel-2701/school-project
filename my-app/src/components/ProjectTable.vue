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
    <v-main>
      <!-- Main content -->
      <v-col cols="12" style="max-width: 1500px; margin: 0px auto">
        <v-card class="text-center" style="width: 100%; margin: 0px auto">
          <!-- Students Data -->
          <v-data-table v-if="users.length > 0" :items="users" align="center">
            <template v-slot:top>
              <v-toolbar flat color="blue darken-2">
                <v-toolbar-title>{{ selectedProject.name }}</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <!-- Removed the button for creating a new project -->
              </v-toolbar>
            </template>
            <template v-slot:item="{ item }">
              <tr @click="handleRowClick(item)" class="clickable-row">
                <td v-for="(value, key) in item" :key="key">
                  {{ value }}
                </td>
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
                    <span>Assign Grades</span>
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
          Assign Grades to {{ selectedUser.nombre }}
          {{ selectedUser.apellido }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <v-select
                v-model="selectedUser.grades.grade1"
                :items="gradeOptions"
                label="Grade 1"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="selectedUser.grades.grade2"
                :items="gradeOptions"
                label="Grade 2"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="selectedUser.grades.grade3"
                :items="gradeOptions"
                label="Grade 3"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="editDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="blue darken-1" text @click="saveGrades">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for enabling consultancies -->
    <v-dialog v-model="enableConsultanciesDialog" max-width="800">
      <v-card>
        <v-card-title class="headline">
          Enable Consultancies for {{ selectedStudent.nombre }}
          {{ selectedStudent.apellido }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedStudent.consultancies"
            label="Number of Consultancies (Max: 16)"
            type="number"
            max="16"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="blue darken-1"
            text
            @click="enableConsultanciesDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="blue darken-1" text @click="enableConsultancies"
            >Enable</v-btn
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
      editDialog: false,
      editedProjectName: '',
      editedProjectId: '',
      newProject: {
        name: '',
        company: '',
        _id: ''
      },
      showProjects: true,
      projects: [],
      students: [],
      users: [],
      sidebarItems: [{ title: 'Projects', icon: 'mdi-folder-outline' }],
      userName: 'John Doe',
      drawer: false,
      selectedProject: null,
      selectedUser: {},
      gradeOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      enableConsultanciesDialog: false,
      numberOfConsultancies: 1
    }
  },
  beforeRouteEnter (to, from, next) {
    const projectId = parseFloat(to.params.projectId)
    axios
      .get(`http://localhost:3000/projects/${projectId}`)
      .then((response) => {
        next((vm) => {
          vm.selectedProject = response.data
        })
      })
      .catch((error) => {
        console.error('Error fetching user details:', error)
        next(false) // Prevent component from rendering
      })
  },
  methods: {
    async fetchData () {
      try {
        const teacherResponse = await axios.get(
          `http://localhost:3000/users/${this.id}`
        )
        const teacher = teacherResponse.data

        const studentsResponse = await axios.get(
          'http://localhost:3000/students'
        )
        const allStudents = studentsResponse.data

        const teacherStudents = allStudents.filter((student) =>
          teacher.alumnos.includes(student._id)
        )

        const projectIds = teacherStudents.map((student) => student.project)

        const projectsResponse = await axios.get(
          'http://localhost:3000/projects'
        )
        const projects = projectsResponse.data

        const filteredProjects = projects.filter((project) =>
          projectIds.includes(project._id)
        )

        this.projects = filteredProjects
        this.students = teacherStudents
        this.users = this.students.filter(
          (student) => student.project === this.selectedProject._id
        )
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    openGradeDialog (user, event) {
      event.stopPropagation()
      this.selectedUser = user
      if (!this.selectedUser.grades) {
        this.selectedUser.grades = { grade1: null, grade2: null, grade3: null }
      }
      this.editDialog = true
    },
    saveGrades () {
      axios
        .put(
          `http://localhost:3000/users/${this.selectedUser._id}`,
          this.selectedUser
        )
        .then((response) => {
          console.log('User updated successfully:', response.data)
          this.editDialog = false
          this.fetchData()
        })
        .catch((error) => {
          console.error('Error updating user:', error)
        })
    },
    openConsultanciesDialog (student, event) {
      event.stopPropagation()
      this.selectedStudent = student
      this.enableConsultanciesDialog = true
    },
    enableConsultancies () {
      const numberOfConsultancies = parseInt(
        this.selectedStudent.consultancies
      )
      console.log('Number of Consultancies to Enable:', numberOfConsultancies)
      this.updateConsultancies(numberOfConsultancies)
    },
    updateConsultancies () {
      axios
        .put(
          `http://localhost:3000/users/${this.selectedStudent._id}`,
          this.selectedStudent
        )
        .then((response) => {
          console.log(
            'User consultancies updated successfully:',
            response.data
          )
          this.enableConsultanciesDialog = false
          this.fetchData()
        })
        .catch((error) => {
          console.error('Error updating user consultancies:', error)
        })
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
    }
  },
  mounted () {
    this.fetchData()
    // Filter students based on the selected project ID
    this.users = this.students.filter(
      (student) => student.project === this.selectedProject._id
    )
  }
}
</script>

<style scoped>
/* Adjustments for burger menu icon color */
.v-btn i {
  color: white;
}

.clickable-row:hover {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
