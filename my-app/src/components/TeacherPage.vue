<template>
  <v-app>
    <v-container>
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
        <v-row>
          <v-col
            v-for="project in projects"
            :key="project._id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            xl="2"
          >
            <ProjectCard
              :projectName="project.nombre"
              :studentCount="getStudentsCount(project._id)"
              @click="onClick(project)"
            />
          </v-col>
        </v-row>
      </v-main>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios'
import ProjectCard from '@/components/ProjectCard.vue'

export default {
  components: {
    ProjectCard
  },
  data () {
    return {
      id: localStorage.getItem('id'),
      showProjects: true,
      projects: [],
      students: [],
      sidebarItems: [{ title: 'Proyectos', icon: 'mdi-folder-outline' }],
      drawer: false,
      userName: localStorage.getItem('userName')
    }
  },
  methods: {
    getStudentsCount (projectId) {
      const a = this.students.filter(
        (student) => student.proyecto === projectId
      )
      return a.length
    },
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

        const projectIds = teacherStudents.map((student) => student.proyecto)

        const projectsResponse = await axios.get(
          'http://localhost:3000/projects'
        )
        const projects = projectsResponse.data

        const filteredProjects = projects.filter((project) =>
          projectIds.includes(project._id)
        )

        this.projects = filteredProjects
        this.students = teacherStudents
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },

    onClick (project) {
      // Navigate to the new route with the project ID as a route parameter
      this.$router.push({
        name: 'ProjectTable',
        params: { projectId: project._id }
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
    }
  },
  mounted () {
    this.fetchData()
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
