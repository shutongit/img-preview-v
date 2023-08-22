<script>
/** 判断是否是数字 */
function isNumber(val) {
  return typeof val === 'number'
}
/** 获取所有key */
const keysOf = (obj) => Object.keys(obj)

/** 名字空间 */
const NameSpace = (prefix = '') => {
  // 拼接名字
  const append = (space) => {
    return prefix + (space ? '_' : '') + space
  }
  // 判断是否可以添加
  const judegeAppend = (space, ...args) => {
    const state = args.length >= 1 ? args[0] : true
    return space && state ? `is-${space}` : ''
  }
  return { append, judegeAppend }
}

// 默认的层级
const defaultInitialZIndex = 2000
</script>
<script setup>
import {
  markRaw,
  computed,
  effectScope,
  ref,
  shallowRef,
  nextTick,
  watch,
  onMounted,
} from 'vue'
import { useEventListener } from '@vueuse/core'
import {
  ArrowLeft,
  ArrowRight,
  Close,
  FullScreen,
  RefreshLeft,
  RefreshRight,
  ScaleToOriginal,
  ZoomIn,
  ZoomOut,
} from '@element-plus/icons-vue'

import { throttle } from 'lodash'
const props = defineProps({
  /** 预览的链接列表 */
  urlList: { type: Array, default: [] },

  /** 预览视图的层级 */
  zIndex: { type: Number },

  /** 初始化时的下标, 小于等于 `url-list` 的长度. */
  initialIndex: { type: Number, default: 0 },

  /** 是否无限循环 */
  infinite: { type: Boolean, default: true },

  /** 点击背景视图是否隐藏视图 */
  hideOnClickModal: Boolean,

  /** 是否添加到body中；false添加到父类中，true添加到body中 */
  teleported: Boolean,

  /** 是否使用ESC关闭视图 */
  closeOnPressEscape: { type: Boolean, default: true },

  /** 缩放的速率  */
  zoomRate: { type: Number, default: 1.2 },
})

const emits = defineEmits({
  close: () => true,
  switch: (index) => isNumber(index),
})

/** 显示模式 */
const modes = {
  CONTAIN: {
    name: 'contain',
    icon: markRaw(FullScreen),
  },
  ORIGINAL: {
    name: 'original',
    icon: markRaw(ScaleToOriginal),
  },
}
// 当前预览视图
const wrapper = ref()
const imgRefs = ref([])

// 类名空间
const nameSpace = NameSpace('img-view')

// 本地作用域
const scopeEventListener = effectScope()

// loading状态
const loading = ref(true)

// 当前所在的下标位置
const activeIndex = ref(props.initialIndex)

// 浅层状态
const mode = shallowRef(modes.CONTAIN)

/** 图片的基础状态：缩放、位置、角度 */
const transform = ref({
  scale: 1,
  deg: 0,
  offsetX: 0,
  offsetY: 0,
  enableTransition: false,
})

/** 是否是单链接 */
const isSingle = computed(() => {
  return props?.urlList?.length <= 1
})

/** 是否是第一个链接 */
const isFirst = computed(() => {
  return activeIndex.value === 0
})

/** 是否是最后一个链接 */
const isLast = computed(() => {
  return activeIndex.value === props.urlList.length - 1
})

/** 当前下标的链接 */
const currentImg = computed(() => {
  return props.urlList[activeIndex.value]
})

/** 上一个按钮的类名 */
const arrowPrevKls = computed(() => [
  nameSpace.append('btn'),
  nameSpace.append('prev'),
  nameSpace.judegeAppend('disabled', !props.infinite && isFirst.value),
])

/** 下一个按钮的类名 */
const arrowNextKls = computed(() => [
  nameSpace.append('btn'),
  nameSpace.append('next'),
  nameSpace.judegeAppend('disabled', !props.infinite && isFirst.value),
])

/** 图片样式 */
const imageStyle = computed(() => {
  const { scale, deg, offsetX, offsetY, enableTransition } = transform.value
  let translateX = offsetX / scale
  let translateY = offsetY / scale

  switch (deg % 360) {
    case 90:
    case -270:
      ;[translateX, translateY] = [translateY, -translateX]
      break
    case 180:
    case -180:
      ;[translateX, translateY] = [-translateX, -translateY]
      break
    case 270:
    case -90:
      ;[translateX, translateY] = [-translateY, translateX]
      break
  }

  const style = {
    transform: `scale(${scale}) rotate(${deg}deg) translate(${translateX}px, ${translateY}px)`,
    transition: enableTransition ? 'transform .3s' : '',
  }

  if (mode.value.name === modes.CONTAIN.name) {
    style.maxWidth = style.maxHeight = '100%'
  }
  return style
})

/** 获取图层层级 */
const computedZIndex = computed(() => {
  return isNumber(props.zIndex)
    ? props.zIndex + defaultInitialZIndex
    : defaultInitialZIndex
})

/** 隐藏关闭 */
function hide() {
  unregisterEventListener()
  emits('close')
}

/** 注册监听 */
function registerEventListener() {
  // 键盘事件
  const keydownHandler = throttle((e) => {
    switch (e.code) {
      // ESC
      case 'Escape':
        props.closeOnPressEscape && hide()
        break
      // SPACE
      case 'Space':
        toggleMode()
        break
      // LEFT_ARROW
      case 'ArrowLeft':
        prev()
        break
      // RIGHT_ARROW
      case 'ArrowRight':
        next()
        break
      // UP_ARROW
      case 'ArrowUp':
        handleActions('zoomIn')
        break
      // DOWN_ARROW
      case 'ArrowDown':
        handleActions('zoomOut')

        break
    }
  })

  // 滚轮事件
  const mousewheelHandler = throttle((e) => {
    const delta = e.deltaY || e.deltaX
    handleActions(delta < 0 ? 'zoomIn' : 'zoomOut', {
      zoomRate: props.zoomRate,
      enableTransition: false,
    })
  })

  // 开启局部监听
  scopeEventListener.run(() => {
    useEventListener(document, 'keydown', keydownHandler)
    useEventListener(document, 'wheel', mousewheelHandler)
  })
}

/** 注销局部监听 */
function unregisterEventListener() {
  scopeEventListener.stop()
}

/** 图片加载完成 */
function handleImgLoad() {
  loading.value = false
}

/** 图片加载失败 */
function handleImgError(e) {
  loading.value = false
  e.target.alt = '图片加载失败！'
}

/** 按下事件 */
function handleMouseDown(e) {
  if (loading.value || e.button !== 0 || !wrapper.value) return
  transform.value.enableTransition = false

  const { offsetX, offsetY } = transform.value
  const startX = e.pageX
  const startY = e.pageY

  const dragHandler = throttle((ev) => {
    transform.value = {
      ...transform.value,
      offsetX: offsetX + ev.pageX - startX,
      offsetY: offsetY + ev.pageY - startY,
    }
  })

  // 移动事件
  const removeMousemove = useEventListener(document, 'mousemove', dragHandler)
  // 抬起事件
  useEventListener(document, 'mouseup', () => {
    removeMousemove() // 移除监听
  })

  e.preventDefault()
}

/** 重置事件 */
function reset() {
  transform.value = {
    scale: 1,
    deg: 0,
    offsetX: 0,
    offsetY: 0,
    enableTransition: false,
  }
}

/** 切换显示模式 */
function toggleMode() {
  if (loading.value) return

  const modeNames = keysOf(modes)
  const modeValues = Object.values(modes)
  const currentMode = mode.value.name
  const index = modeValues.findIndex((i) => i.name === currentMode)
  const nextIndex = (index + 1) % modeNames.length
  mode.value = modes[modeNames[nextIndex]]
  reset()
}

/**
 * 设置当前活跃视图的下标
 * @param {Number} index 下标
 */
function setActiveItem(index) {
  const len = props.urlList?.length || 0
  activeIndex.value = (index + len) % len
}

/** 上一个 */
function prev() {
  if (isFirst.value && !props.infinite) return
  setActiveItem(activeIndex.value - 1)
}

/** 下一个 */
function next() {
  if (isLast.value && !props.infinite) return
  setActiveItem(activeIndex.value + 1)
}

/** 动作 */
function handleActions(action, options = {}) {
  if (loading.value) return
  const { zoomRate, rotateDeg, enableTransition } = {
    zoomRate: props.zoomRate,
    rotateDeg: 90,
    enableTransition: true,
    ...options,
  }
  switch (action) {
    case 'zoomOut':
      if (transform.value.scale > 0.2) {
        transform.value.scale = Number.parseFloat(
          (transform.value.scale / zoomRate).toFixed(3)
        )
      }
      break
    case 'zoomIn':
      if (transform.value.scale < 7) {
        transform.value.scale = Number.parseFloat(
          (transform.value.scale * zoomRate).toFixed(3)
        )
      }
      break
    case 'clockwise':
      transform.value.deg += rotateDeg
      break
    case 'anticlockwise':
      transform.value.deg -= rotateDeg
      break
  }
  transform.value.enableTransition = enableTransition
}

/** 链接更新，加载链接 */
watch(currentImg, () => {
  nextTick(() => {
    const $img = imgRefs.value[0]
    if (!$img?.complete) {
      loading.value = true
    }
  })
})

/** 下标更新，重置视图 */
watch(activeIndex, (val) => {
  reset()
  emits('switch', val)
})

/** 视图加载完成 */
onMounted(() => {
  registerEventListener()
  wrapper.value?.focus?.()
})

/** 向外暴露 */
defineExpose({
  setActiveItem,
})
</script>

<template>
  <teleport to="body" :disabled="!teleported">
    <transition name="viewer-fade" appear>
      <div
        ref="wrapper"
        :tabindex="-1"
        :class="nameSpace.append('wrapper')"
        :style="{ zIndex: computedZIndex }">
        <div
          :class="nameSpace.append('mask')"
          @click.self="hideOnClickModal && hide()" />
        <!-- 关闭按钮 -->
        <span
          :class="[nameSpace.append('btn'), nameSpace.append('close')]"
          @click="hide">
          <div :class="nameSpace.append('icon')"><Close></Close></div>
          <!-- <Close :class="nameSpace.append('icon')"></Close> -->
        </span>

        <!-- 上一个下一个 -->
        <template v-if="!isSingle">
          <span :class="arrowPrevKls" @click="prev">
            <div :class="nameSpace.append('icon')"><ArrowLeft></ArrowLeft></div>
          </span>
          <span :class="arrowNextKls" @click="next">
            <div :class="nameSpace.append('icon')">
              <ArrowRight></ArrowRight>
            </div>
          </span>
        </template>

        <!-- 工具栏 -->
        <div :class="[nameSpace.append('btn'), nameSpace.append('actions')]">
          <div :class="nameSpace.append('actions__inner')">
            <div
              :class="nameSpace.append('icon')"
              @click="handleActions('zoomOut')">
              <ZoomOut />
            </div>
            <div
              :class="nameSpace.append('icon')"
              @click="handleActions('zoomIn')">
              <ZoomIn />
            </div>
            <i :class="nameSpace.append('actions__divider')"></i>
            <div :class="nameSpace.append('icon')" @click="toggleMode">
              <component :is="mode.icon"></component>
            </div>
            <i :class="nameSpace.append('actions__divider')"></i>
            <div
              :class="nameSpace.append('icon')"
              @click="handleActions('anticlockwise')">
              <RefreshLeft />
            </div>
            <div
              :class="nameSpace.append('icon')"
              @click="handleActions('clockwise')">
              <RefreshRight />
            </div>
          </div>
        </div>

        <!-- 图片 -->
        <div :class="nameSpace.append('canvas')">
          <img
            v-for="(url, i) in urlList"
            v-show="i === activeIndex"
            :ref="(el) => (imgRefs[i] = el)"
            :key="url"
            :src="url"
            :style="imageStyle"
            :class="nameSpace.append('img')"
            @load="handleImgLoad"
            @error="handleImgError"
            @mousedown="handleMouseDown" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.img-view_wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.img-view_mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0.5;
  background: #000;
}

.img-view_btn {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0.8;
  cursor: pointer;
  box-sizing: border-box;
  user-select: none;
}

.img-view_close {
  top: 40px;
  right: 40px;
  width: 44px;
  height: 44px;
  font-size: 24px;
  color: #fff;
  background-color: #606266;
  border-color: #fff;
}

.img-view_prev {
  top: 50%;
  transform: translateY(-50%);
  left: 40px;
  width: 44px;
  height: 44px;
  font-size: 24px;
  color: #fff;
  background-color: #606266;
  border-color: #fff;
}
.img-view_next {
  top: 50%;
  transform: translateY(-50%);
  right: 40px;
  text-indent: 2px;
  width: 44px;
  height: 44px;
  font-size: 24px;
  color: #fff;
  background-color: #606266;
  border-color: #fff;
}

.img-view_actions {
  left: 50%;
  bottom: 30px;
  transform: translate(-50%);
  width: 282px;
  height: 44px;
  padding: 0 23px;
  background-color: #606266;
  border-color: #fff;
  border-radius: 22px;
}
.img-view_actions__inner {
  width: 100%;
  height: 100%;
  text-align: justify;
  cursor: default;
  font-size: 23px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.img-view_canvas {
  position: static;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}
.img-view_icon {
  --color: inherit;
  height: 1em;
  width: 1em;
  line-height: 1em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  fill: currentColor;
  color: var(--color);
  font-size: inherit;
}
</style>
