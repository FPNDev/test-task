<template>
  <div class="weight" :class="weightClass" :style="weightStyle" ref="self"></div>
</template>

<script>
import { WeightTypeClassMap } from '../constant/teeter';

export default {
  name: 'Weight',
  props: {
    type: Number,
    mass: Number
  },
  computed: {
    dom() {
      return this.$refs.self;
    },
    weightClass() {
      return { [WeightTypeClassMap[this.type]]: true };
    },
    weightStyle() {
      return {
        ['--mass']: this.mass || 1
      }
    }
  }
}
</script>