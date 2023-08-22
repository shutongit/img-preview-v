<script setup>
import { ref } from 'vue'
// import ImageViewer from './components/ImageViewer.vue'
import { ImagePreview } from 'img-preview-v'
// import { ImagePreview } from '../dist/image-preview.es'

const show = ref(false)
/** 显示图片是图 */
function handShowImage() {
  show.value = true
}
function close() {
  show.value = false
}

const urlList = ref([
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
  'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
])
</script>

<template>
  <button @click="handShowImage">点击显示</button>
  <ImagePreview v-if="show" :url-list="urlList" @close="close"></ImagePreview>
  <!-- <ImageViewer
    v-if="show"
    :url-list="[
      'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
      'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
    ]"
    :zIndex="9007199254740991"
    @close="close"></ImageViewer> -->
</template>

<style scoped>
.image {
  width: 200px;
  height: 200px;
  object-fit: contain;
}
</style>
