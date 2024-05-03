<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Assigned Project
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submitFile">Submit File</v-btn>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="project in projects" :key="project.id">
                <v-list-item-content>
                  <v-list-item-title>{{ project.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{
                    project.description
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
          <v-card-title>Submit File</v-card-title>
          <v-card-text>
            <v-form>
              <v-file-input
                label="Upload File"
                v-model="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ></v-file-input>
              <v-btn color="primary" @click="submitFile">Submit</v-btn>
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
      projects: [], // This should be populated with actual data from your backend
      file: null
    }
  },
  methods: {
    submitFile () {
      // Logic to submit the file
      // You might need to handle file uploads to your backend here
    }
  }
}
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}
</style>
