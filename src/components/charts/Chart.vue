<script lang="ts" setup>

import {onMounted, ref, unref, watch} from "vue";
import Chart from 'chart.js/auto';
import {ChartData, ChartOptions, ChartType} from "chart.js/dist/types";
import vuetify from "@/plugins/vuetify";

const props = defineProps<{
  data: ChartData
  options?: ChartOptions
  type: ChartType
}>()

const canvas = ref(null)
let chart: Chart | null = null;

onMounted(() => {
  const $canves = unref(canvas)
  if (!$canves) {
    return
  }

  chart = new Chart(
    unref($canves),
    {
      data: props.data,
      type: props.type,
      options: {
        aspectRatio: unref(vuetify.display.mobile) ? 1 : 2,
        ...props.options,
      }
    }
  );
})

watch(props, () => {
  if (!chart) {
    return
  }

  chart.data = unref(props).data
  chart.update()
})

</script>

<template>
  <VSheet class="chart-sheet">
    <canvas ref="canvas"></canvas>
  </VSheet>
</template>
