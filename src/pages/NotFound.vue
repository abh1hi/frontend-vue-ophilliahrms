<template>
  <v-empty-state
    icon="mdi-magnify"
    text="The page you were looking for does not exist."
    title="Page Not Found"
  >
    <template v-slot:actions>
      <v-btn
        color="primary"
        elevation="1"
        text="Go to Dashboard"
        to="/"
      ></v-btn>
    </template>
  </v-empty-state>
</template>

<script setup lang="ts">
// Basic 404 page
</script>
