<template>
  <div class="teeter" :style="screenStyle">
    <Weight v-if="currentWeight" 
            class="_moving"
            :type="currentWeight.type" 
            :mass="currentWeight.mass"
            :style="userWeightStyle"
            ref="currentWeight"
    ></Weight>
    <div :style="lineStyle">
      <template v-for="(w, i) in weights" :key="i">
        <Weight 
          :type="w.weight.type" 
          :mass="w.weight.mass"
          :style="w.style"
          :ref="setStaticWeightRef"
        ></Weight>
      </template>
      <div class="teeter-line" ref="teeterLine"></div>
    </div>
    <div class="teeter-base"></div>
  </div>
  <div v-if="!playing" class="status">Press "Space" to continue simulation</div>
  <div class="controls">
    <p><b>Right -&gt;, Left &lt;-</b>: Move object</p>
    <p><b>Bottom &#8595;</b>: Speed object up</p>
    <p><b>Space</b>: Play/pause simulation</p>
  </div>
</template>

<script>
import Weight from './Weight.vue'
import { TeeterLength, PxPerMeter, Torque, WeightType, FallStartSpeed, FallSpeedAmplifier, FallSpeedMax } from '../constant/teeter';
import { createRandomWeight } from '../service/weight';
import { collides, collidesLine } from '../service/collision';

const AllowedControls = {
  'ArrowLeft': (movements) => {
    movements.left = Math.max(0, movements.left - 10);
  },
  'ArrowRight': (movements, line, weight) => {
    movements.left = Math.min(line.offsetWidth / 2 - weight.dom.offsetWidth, movements.left + 10);
  },
  'ArrowDown': () => {
    fallSpeedMultiplier = 10;
  }
};

let fallSpeedMultiplier = 1;

export default {
  name: 'Teeter',
  components: {
    Weight
  },
  data() {
    return {
      weights: [],
      staticWeight: [],
      currentWeight: null,
      currentWeightMovement: null,
      fallSpeed: FallStartSpeed,
      playing: false
    }
  },
  mounted() {
    this.addUserWeight();

    this.registerMovement();
    this.registerControls();
  },
  beforeUpdate() {
    this.staticWeight = []
  },
  methods: {
    registerMovement() {
      setInterval(() => {
        if (this.playing && this.currentWeightMovement) {
          this.currentWeightMovement.top += this.fallSpeed * fallSpeedMultiplier;

          if (collidesLine(this.$refs.currentWeight.dom, this.$refs.teeterLine, this.lineAngle)) {
            this.addWeight();
          }
        }
      }, 50);
    },
    registerControls() {
      let currentUserControl;

      setInterval(() => {
        if (!this.playing) {
          return;
        }

        if (currentUserControl) {
          AllowedControls[currentUserControl](this.currentWeightMovement, this.$refs.teeterLine, this.$refs.currentWeight);
        }
      }, 50);

      window.addEventListener('keydown', e => {
        if (!this.playing) {
          return;
        }

        if (Object.keys(AllowedControls).includes(e.code)) {
          currentUserControl = e.code;
          AllowedControls[currentUserControl](this.currentWeightMovement, this.$refs.teeterLine, this.$refs.currentWeight);
        }
      });
      window.addEventListener('keyup', e => {
        if (e.code === currentUserControl) {
          fallSpeedMultiplier = 1;
          currentUserControl = null;
        }
      });

      window.addEventListener('keypress', e => {
        if (e.code === 'Space') {
          this.playing = !this.playing;

          fallSpeedMultiplier = 1;
          currentUserControl = null;
        }
      });
    },

    resetGame() {
      this.weights.splice(0);
    },

    addUserWeight() {
      this.currentWeight = createRandomWeight();
      this.currentWeightMovement = { top: 0, left: 0 };

      this.fallSpeed = Math.min(FallSpeedMax, this.fallSpeed + FallSpeedAmplifier);
    },
    addRobotWeight() {
      const position = TeeterLength / 2 + Math.random() * (TeeterLength / 2);

      this.weights.push({
        position: position, 
        weight: createRandomWeight(),
        style: {
          position: 'fixed',
          left: `${position * PxPerMeter}px`,
          bottom: 0
        }
      });
    },

    checkWeights() {
      if (Math.abs(this.lineAngle) >= 30) {
        this.resetGame();
      }

      let weightMap = [];

      for (const w of this.weights) {
        const positionIndex = parseInt(w.position);
        weightMap[positionIndex] = (weightMap[positionIndex] || 0) + w.weight.mass;
        weightMap[positionIndex + 1] = (weightMap[positionIndex + 1] || 0) + w.weight.mass;
        weightMap[positionIndex - 1] = (weightMap[positionIndex - 1] || 0) + w.weight.mass;

        if (weightMap[positionIndex] >= 20 || weightMap[positionIndex + 1] >= 20 || weightMap[positionIndex - 1] >= 20) {
          this.resetGame();
          break;
        }
      }
    },

    addWeight(collisionRef) {
      if (!this.currentWeight) {
        return;
      }

      this.weights.push({ 
        position: this.currentWeightMovement.left / PxPerMeter, 
        weight: this.currentWeight,
        style: {
          position: 'fixed',
          left: `${this.currentWeightMovement.left}px`,
          bottom: 0
        }
      });
      this.addRobotWeight();
      this.addUserWeight();

      this.checkWeights();
    },

    setStaticWeightRef(ref) {
      this.staticWeight.push(ref);
    }
  },
  computed: {
    userWeightStyle() {
      return {
        top: `${this.currentWeightMovement?.top || 0}px`,
        left: `${this.currentWeightMovement?.left || 0}px`,
      }
    },

    lineAngle() {
      let beforeCenter = 0,
          afterCenter = 0;

      for (const weight of this.weights) {
        const distanceFromCenter = Math.abs(TeeterLength / 2 - weight.position);
        if (weight.position > TeeterLength / 2) {
          afterCenter += weight.weight.mass * distanceFromCenter;
        } else {
          beforeCenter += weight.weight.mass * distanceFromCenter;
        }
      }

      return (afterCenter - beforeCenter) * Torque;
    },
    lineStyle() {
      return {
        transform: `rotate(${this.lineAngle}deg)`
      }
    },
    screenStyle() {
      return {
        ['padding-top']: `${TeeterLength * 0.15 * PxPerMeter}px`,
        ['padding-bottom']: `${TeeterLength * 0.15 * PxPerMeter}px`,
        width: `${TeeterLength * PxPerMeter}px`
      }
    }
  }
}
</script>