<template>
  <div><q-btn>你好，我是quasar</q-btn>  <q-card
      class="my-card text-white"
      style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)"
    >
      <q-card-section>
        <div class="text-h6">Our Changing Planet</div>
        <div class="text-subtitle2">by John Doe</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

      </q-card-section>
    </q-card>
    <q-input v-model="text" label="Standard" />

<q-input filled v-model="text" label="Filled" />

<q-input outlined v-model="text" label="Outlined" />

<q-input standout v-model="text" label="Standout" />
<q-chip icon="event">Add to calendar</q-chip>

</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'IndexPage',
  setup(){
    return {
      text: ref('')
    }
  }
})
</script>
