<template>
  Дай мяч {{ contestDescription }}
  <canvas ref="canvas" />
</template>

<script setup lang="ts">
  const token = defineModel('token', {
    type: String,
  })

  const canvas = ref<HTMLCanvasElement>()
  const contestDescription = ref('')

  const captcha = useFootballCaptcha(canvas)

  captcha.state.on('success', (tokenStr) => {
    token.value = tokenStr
  })

  captcha.state.on('contestDescription', (description) => {
    contestDescription.value = description
  })

  onMounted(() => {
    captcha.load()
  })
</script>