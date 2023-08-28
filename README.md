> 一个 vue 图片浏览器，支持单张图片和多图预览，可以自由移动、旋转、放大、缩小

## 1. 安装

```bash
npm i img-preview-v
```

## 2. 使用

### 2.1 导入

```js
import { ImagePreview } from 'img-preview-v'
```

### 2.2 使用

```vue
<script setup>
const urlList = ref([
  'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
])
// const urlList = ref([
//   'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
//   'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
// ])
</script>

<templete>
  <ImagePreview v-if="show" :url-list="urlList" @close="close"></ImagePreview>
</templete>
```

## 3. 参数

```js
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
```
