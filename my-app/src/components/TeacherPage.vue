<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Students
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="assignGrades">Assign Grades</v-btn>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="student in students" :key="student.id">
                <v-list-item-content>
                  <v-list-item-title>{{ student.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    student.project
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Assign Grades</v-card-title>
          <v-card-text>
            <v-form>
              <v-select
                :items="students"
                item-text="name"
                item-value="id"
                label="Select Student"
                v-model="selectedStudent"
              ></v-select>
              <v-text-field label="Grade" v-model="grade"></v-text-field>
              <v-btn color="primary" @click="submitGrade">Submit</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      students: [], // This should be populated with actual data from your backend
      selectedStudent: null,
      grade: ''
    }
  },
  methods: {
    assignGrades () {
      // Logic to assign grades
    },
    submitGrade () {
      // Logic to submit the grade for the selected student
    }
  }
}
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}
</style>
