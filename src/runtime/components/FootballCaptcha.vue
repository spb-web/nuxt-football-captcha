<template>
  <canvas ref="canvas" />
</template>

<script setup lang="ts">
  import {ref, onMounted, defineModel, toRef} from 'vue';
  import {useFootballCaptcha} from '../composables/useFootballCaptcha'

  const token = defineModel('token', {
    type: String,
  })

  token.value = ''

  const description = defineModel('description', {
    type: String,
  })
  const props = defineProps({
    api: {
      type: String,
      default: '/api/footballCaptcha',
    }
  })

  const canvas = ref<HTMLCanvasElement>()

  const captcha = useFootballCaptcha(canvas, toRef(() => props.api))

  captcha.state.on('success', (tokenStr) => {
    token.value = tokenStr
  })

  captcha.state.on('contestDescription', (contestDescription) => {
    description.value = contestDescription
  })

  onMounted(() => {
    captcha.load()
  })
</script>