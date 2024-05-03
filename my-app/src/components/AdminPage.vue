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
        <v-col cols="12" style="max-width: 1500px; margin: 0px auto">
          <v-card class="text-center" style="width: 100%; margin: 0px auto;">
            <!-- Projects Data -->
            <v-data-table
              v-if="projects.length > 0"
              :items="projects"
              align="center"
            >
              <template v-slot:top>
                <v-toolbar flat color="blue darken-2">
                  <v-toolbar-title>Projects</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn icon color="blue darken-2" @click="openCreateDialog">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item="{ item }">
                <tr>
                  <td v-for="(value, key) in item" :key="key">
                    {{ value }}
                  </td>
                  <td>
                    <!-- Use small prop to make the buttons smaller -->
                    <v-btn
                      icon
                      small
                      color="blue darken-2"
                      @click="editProject(item)"
                      style="width: 30px; height: 30px; margin-right: 5px"
                    >
                      <v-icon style="font-size: 18px">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      small
                      color="red darken-2"
                      @click="deleteProject(item)"
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

      <!-- Edit Dialog -->
      <v-dialog v-model="editDialog" max-width="500">
        <v-card>
          <v-card-title>Edit Project Name</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editedProjectName"
              label="Project Name"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-2" @click="saveEditedProject">Save</v-btn>
            <v-btn @click="cancelEdit">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create Dialog -->
      <v-dialog v-model="createDialog" max-width="500">
        <v-card>
          <v-card-title>Create New Project</v-card-title>
          <v-card-text>
            <v-text-field v-model="newProject._id" label="ID"></v-text-field>
            <v-text-field
              v-model="newProject.name"
              label="Project Name"
            ></v-text-field>
            <v-text-field
              v-model="newProject.company"
              label="Company"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-2" @click="saveNewProject">Save</v-btn>
            <v-btn @click="cancelCreate">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      projects: [],
      tableHeaders: [],
      sidebarItems: [
        { title: 'Projects', icon: 'mdi-folder-outline' },
        { title: 'Students', icon: 'mdi-account-plus-outline' },
        { title: 'Teachers', icon: 'mdi-account-tie' }
      ],
      userName: 'John Doe',
      drawer: false,
      editDialog: false,
      editedProjectName: '',
      editedProjectId: '',
      createDialog: false,
      newProject: {
        name: '',
        company: '',
        _id: ''
      }
    }
  },
  methods: {
    async fetchData () {
      try {
        const response = await axios.get('http://localhost:3000/projects')
        this.projects = response.data

        // Generate table headers based on the keys of the first project
        if (this.projects.length > 0) {
          // Access the first project from the reactive proxy object
          const firstProject = this.projects[0]

          // Extract keys from the first project and capitalize them
          const keys = Object.keys(firstProject).map((key) => ({
            text: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
            value: key
          }))

          // Set the tableHeaders property with the generated headers
          this.tableHeaders = keys
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    },

    navigate (index) {
      switch (index) {
        case 0:
          this.$router.push('/admin')
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
      // Logic to logout the user
      // For example, you can clear any user data or tokens stored in localStorage
      localStorage.removeItem('token')

      // Redirect the user to the login page
      this.$router.push('/login')
    },
    editProject (project) {
      this.editedProjectName = project.name
      this.editedProjectId = project._id
      this.editDialog = true
    },
    saveEditedProject () {
      // Create an object with the updated project data
      const updatedProject = {
        name: this.editedProjectName // Assuming the only editable field is the project name
      }

      // Make an HTTP PUT request to update the project
      axios
        .put(
          `http://localhost:3000/projects/${this.editedProjectId}`,
          updatedProject
        )
        .then((response) => {
          // Check if the project was successfully updated
          if (response.status === 200) {
            console.log('Project updated successfully:', response.data)

            // Optionally, you can fetch the updated projects from the server again
            this.fetchData()
          } else {
            console.error('Failed to update project:', response.data)
          }
        })
        .catch((error) => {
          console.error('Error updating project:', error)
        })

      // Close the edit dialog
      this.editDialog = false
    },

    deleteProject (project) {
      // Prompt the user for confirmation before deleting the project
      if (confirm('Are you sure you want to delete this project?')) {
        // Make an HTTP DELETE request to delete the project
        axios
          .delete(`http://localhost:3000/projects/${project._id}`)
          .then((response) => {
            // Check if the project was successfully deleted
            if (response.status === 200) {
              console.log('Project deleted successfully:', response.data)

              // Optionally, you can fetch the updated projects from the server again
              this.fetchData()
            } else {
              console.error('Failed to delete project:', response.data)
            }
          })
          .catch((error) => {
            console.error('Error deleting project:', error)
          })
      }
    },
    openCreateDialog () {
      this.createDialog = true
    },
    saveNewProject () {
      axios
        .post('http://localhost:3000/projects', this.newProject)
        .then((response) => {
          if (response.status === 201) {
            console.log('Project created successfully:', response.data)
            this.fetchData()
          } else {
            console.error('Failed to create project:', response.data)
          }
        })
        .catch((error) => {
          console.error('Error creating project:', error)
        })
      this.createDialog = false
    },
    cancelCreate () {
      this.createDialog = false
    },

    cancelEdit () {
      this.editDialog = false
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
</style>
