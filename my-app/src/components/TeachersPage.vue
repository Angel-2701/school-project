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
            <!-- Teachers Data -->
            <v-data-table
              v-if="teachers.length > 0"
              :items="teachers"
              align="center"
            >
              <template v-slot:top>
                <v-toolbar flat color="blue darken-2">
                  <v-toolbar-title>Teachers</v-toolbar-title>
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
                    <v-btn
                      icon
                      small
                      color="blue darken-2"
                      @click="editUser(item)"
                      style="width: 30px; height: 30px; margin-right: 5px"
                    >
                      <v-icon style="font-size: 18px">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      small
                      color="red darken-2"
                      @click="deleteTeacher(item._id)"
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
          <v-card-title>Edit Teacher</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editedTeacher.nombre"
              label="Name"
            ></v-text-field>
            <v-text-field
              v-model="editedTeacher.apellido"
              label="Last Name"
            ></v-text-field>
            <v-text-field
              v-model="editedTeacher.correo"
              label="Email"
            ></v-text-field>
            <v-text-field
              v-model="editedTeacher.contraseña"
              label="Password"
              type="password"
            ></v-text-field>
            <!-- Add v-select to select students -->
            <v-select
              v-model="editedTeacher.alumnos"
              :items="students"
              label="Assign students (max 5)"
              multiple
              chips
            ></v-select>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-2" @click="saveEditedTeacher">Save</v-btn>
            <v-btn @click="cancelEdit">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create Dialog -->
      <v-dialog v-model="createDialog" max-width="500">
        <v-card>
          <v-card-title>Create New Teacher</v-card-title>
          <v-card-text>
            <v-text-field v-model="newTeacher._id" label="ID"></v-text-field>
            <v-text-field
              v-model="newTeacher.nombre"
              label="Name"
            ></v-text-field>
            <v-text-field
              v-model="newTeacher.apellido"
              label="Last Name"
            ></v-text-field>
            <v-text-field
              v-model="newTeacher.correo"
              label="Email"
            ></v-text-field>
            <v-text-field
              v-model="newTeacher.contraseña"
              label="Password"
              type="password"
            ></v-text-field>
            <div>
              <v-select
                v-model="newTeacher.alumnos"
                :items="students"
                label="Assign students (max 5)"
                multiple
                chips
                @update:modelValue="limitSelection"
              ></v-select>
            </div>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-2" @click="saveNewTeacher">Save</v-btn>
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
      students: [],
      selectedOptions: [],
      teachers: [],
      sidebarItems: [
        { title: 'Projects', icon: 'mdi-folder-outline' },
        { title: 'Students', icon: 'mdi-account-plus-outline' },
        { title: 'Teachers', icon: 'mdi-account-tie' }
      ],
      userName: 'John Doe',
      drawer: false,
      editDialog: false,
      editedTeacher: {
        _id: '',
        nombre: '',
        apellido: '',
        correo: '',
        contraseña: '',
        alumnos: []
        // Add more fields as needed
      },
      createDialog: false,
      newTeacher: {
        nombre: '',
        apellido: '',
        correo: '',
        contraseña: ''
        // Add more fields as needed
      }
    }
  },
  methods: {
    limitSelection () {
      if (this.selectedOptions.length > 5) {
        alert('You can only select a maximum of 5 options.')
        this.selectedOptions = this.selectedOptions.slice(0, 5)
      }
    },
    async fetchData () {
      try {
        const response = await axios.get('http://localhost:3000/teachers')
        this.teachers = response.data
      } catch (error) {
        console.error('Error fetching teachers:', error)
      }
    },

    async fetchStudents () {
      try {
        // Fetch all students
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

        // Extract just the names from the unassigned students data
        this.students = unassignedStudents.map((student) => student._id)
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    },

    async navigate (index) {
      switch (index) {
        case 0:
          this.$router.push('/admin')
          break
        case 1:
          this.$router.push('/students')
          break
        case 2:
          this.$router.push('/teachers')
          break
        default:
          break
      }
    },
    logout () {
      // Logic to logout the user
    },
    editUser (teacher) {
      // Assign the teacher data to editedTeacher
      this.editedTeacher = { ...teacher }

      // If editedTeacher has alumnos property, add its students to the students array
      if (
        this.editedTeacher.alumnos &&
        Array.isArray(this.editedTeacher.alumnos)
      ) {
        this.students = [...this.students, ...this.editedTeacher.alumnos]
      }

      // Open the edit dialog
      this.editDialog = true
    },

    async saveEditedTeacher () {
      try {
        // Send the updated teacher data to the server
        const response = await axios.put(
          `http://localhost:3000/users/${this.editedTeacher._id}`,
          this.editedTeacher
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
      this.createDialog = true
      this.fetchStudents()
    },
    async saveNewTeacher () {
      try {
        // Add 'rol' field with value 'teacher'
        this.newTeacher.rol = 'teacher'

        const response = await axios.post(
          'http://localhost:3000/register',
          this.newTeacher
        )
        if (response.status === 201) {
          console.log('Teacher created successfully:', response.data)
          this.fetchData()
        } else {
          console.error('Failed to create teacher:', response.data)
        }
      } catch (error) {
        console.error('Error creating teacher:', error)
      }
      this.createDialog = false
    },

    cancelCreate () {
      this.createDialog = false
    },
    async deleteTeacher (teacherId) {
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
</style>
