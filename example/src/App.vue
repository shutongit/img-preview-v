<script setup>
import { ref } from 'vue'
import { ImagePreview } from 'img-preview-v'

const show = ref(false)
/** 显示图片显示图片视图 */
function handShowImage() {
  show.value = true
  urlList.value = urlList1.value
}
function handShowManyImage() {
  show.value = true
  urlList.value = urlList2.value
}
function close() {
  show.value = false
}
const urlList = ref([])
const urlList1 = ref([
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
])
const urlList2 = ref([
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
  'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
])
</script>

<template>
  <button @click="handShowImage" style="z-index: 10">点击显示一张</button>
  <button @click="handShowManyImage" style="z-index: 100">点击显示多张</button>
  <ImagePreview
    v-if="show"
    :url-list="urlList"
    :closeOnPressEscape="false"
    :hideOnClickModal="true"
    @close="close"></ImagePreview>
</template>

<style scoped>
.image {
  width: 200px;
  height: 200px;
  object-fit: contain;
}
</style>
