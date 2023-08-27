<template>
  <div>
    Nuxt Football Captcha playground!

    <ClientOnly>
      <FootballCaptcha v-model:token="token" />
    </ClientOnly>

    Access token: {{ token }}
  </div>
</template>

<script setup lang="ts">
const token = ref<String>()
</script>
