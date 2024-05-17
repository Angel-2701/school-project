<template>
    <v-card
      class="project-card"
      color="blue darken-2"
      outlined
      :elevation="elevation"
      @click="onClick"
      :class="{ 'hover-effect': isHovered }"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <v-card-title class="project-name">{{ projectName }}</v-card-title>
      <v-card-text class="student-count">{{ studentCount }} Alumnos</v-card-text>
    </v-card>
  </template>

<script>
export default {
  props: {
    projectName: {
      type: String,
      required: true
    },
    studentCount: {
      type: Number,
      default: 0
    },
    elevation: {
      type: [Number, String],
      default: 1
    }
  },
  data () {
    return {
      isHovered: false
    }
  },
  methods: {
    onClick () {
      // Emit a click event when the card is clicked
      this.$emit('click')
    },
    onMouseEnter () {
      // Set isHovered to true when mouse enters the card
      this.isHovered = true
    },
    onMouseLeave () {
      // Set isHovered to false when mouse leaves the card
      this.isHovered = false
    }
  }
}
</script>

  <style scoped>
  .project-card {
    width: 100%;
    max-width: 400px; /* Adjust max-width as needed */
    margin: 20px;
    cursor: pointer;
    transition: box-shadow 0.3s, background-color 0.3s; /* Smooth transition for shadow and background color */
  }

  .project-card.hover-effect {
    box-shadow: 0px 0px 15px 5px rgba(0, 0, 255, 0.5) !important; /* More visible shadow effect on hover */
    background-color: #ccc !important; /* Change background color to gray on hover */
  }

  .project-name {
    font-size: 20px; /* Increase font size for better visibility */
    font-weight: bold;
    color: white; /* Text color */
  }

  .student-count {
    font-size: 16px; /* Increase font size for better visibility */
    color: #ffffff; /* Text color */
  }
  </style>
