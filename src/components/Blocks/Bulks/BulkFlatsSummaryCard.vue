<script setup lang="ts">
import Chart from "@/components/charts/Chart.vue";
import {Bulk} from "@/store/blocks";
import {computed, ref, unref} from "vue";
import moment from "moment";
import {getDatesRange, ISO_DATE} from "@/assets/datetime";
import {
  FLAT_KEY_ROOMS_NONE,
  FLAT_KEY_ROOMS_ONE,
  FLAT_KEY_ROOMS_THREE,
  FLAT_KEY_ROOMS_TWO,
  FLAT_STATUS_SOLD,
  FLATS_NAME_BY_ROOMS_COUNT
} from "@/assets/api/types";
import {LegendItem, TooltipItem} from "chart.js/dist/types";
import {measurement} from "@/assets/numbers";

const props = defineProps<{
  bulk: Bulk
}>()


const dateMin = ref(moment().subtract(30, "days"))
const dateMax = ref(moment())
const dates = computed(() => getDatesRange(unref(dateMin), unref(dateMax)))
const labels = computed(() => unref(dates).map(date => date.format(ISO_DATE)))
const roominessRequired = ref([
  FLAT_KEY_ROOMS_NONE,
  FLAT_KEY_ROOMS_ONE,
  FLAT_KEY_ROOMS_TWO,
  FLAT_KEY_ROOMS_THREE
])

const chartFlatsColors: Record<keyof typeof FLATS_NAME_BY_ROOMS_COUNT, Record<'background' | 'border', string>> = {
  [FLAT_KEY_ROOMS_NONE]: {
    background: "rgba(200, 75, 75, 0.20)",
    border: "rgb(200, 75, 75)",
  },
  [FLAT_KEY_ROOMS_ONE]: {
    background: "rgba(75, 150, 75, 0.20)",
    border: "rgb(75, 150, 75)",
  },
  [FLAT_KEY_ROOMS_TWO]: {
    background: "rgba(75, 75, 200, 0.20)",
    border: "rgb(75, 75, 200)",
  },
  [FLAT_KEY_ROOMS_THREE]: {
    background: "rgba(200, 150, 75, 0.20)",
    border: "rgb(200, 150, 75)",
  }
}

const baseChartOptions = {
  interaction: {
    intersect: false,
    mode: 'index',
  }
}

const flatPricesChartOptions = {
  ...baseChartOptions,
  plugins: {
    legend: {
      labels: {
        filter: function(item: LegendItem) {
          return item.text.includes('Макс');
        }
      }
    },
    tooltip: {
      callbacks: {
        label(item: TooltipItem): string | string[] | undefined {
          const datasetPricesMin = item.chart.config.data.datasets[item.datasetIndex + 1]
          const datasetPricesMax = item.chart.config.data.datasets[item.datasetIndex]

          const priceMin = measurement(datasetPricesMin.data[item.dataIndex])
          const priceMax = measurement(datasetPricesMax.data[item.dataIndex])

          const roominess = item.dataset.label.replace(' (Макс)', '')

          return `${roominess}: ${priceMin} - ${priceMax}`
        }
      },
      filter(item: TooltipItem) {
        return !item.dataset.label.includes('Мин')
      },
    }
  }
}

const flatsPricesChart = computed(() => {
  const datasets = unref(roominessRequired).map(roominess => {
    const pricesMin: (number | null)[] = []
    const pricesMax: (number | null)[] = []

    unref(dates).forEach(date => {
      const prices = props.bulk.flats
        .filter(flat => flat.rooms.toString() === roominess)
        .filter(flat => {
          const statusOnDate = flat.getStatusOnDate(date)
          return statusOnDate && statusOnDate !== FLAT_STATUS_SOLD
        })
        .map(flat => flat.getPriceOnDate(date))
        .filter(price => typeof price === 'number') as number[]

      pricesMin.push(prices.length ? Math.min(...prices) : null)
      pricesMax.push(prices.length ? Math.max(...prices) : null)
    })

    return [
      {
        backgroundColor: chartFlatsColors[roominess.toString()].background,
        borderColor: chartFlatsColors[roominess.toString()].border,
        data: pricesMax,
        label: FLATS_NAME_BY_ROOMS_COUNT[roominess.toString()] + ' (Макс)',
        fill: '+1',
      },
      {
        borderColor: chartFlatsColors[roominess.toString()].border,
        data: pricesMin,
        label: FLATS_NAME_BY_ROOMS_COUNT[roominess.toString()] + ' (Мин)',
      }
    ]
  })

  return {
    labels: unref(dates).map(date => date.format(ISO_DATE)),
    datasets: datasets.flat(),
  }
})

const flatsSellingChart = computed(() => {
  const datasets = unref(roominessRequired).map(roominess => ({
    label: FLATS_NAME_BY_ROOMS_COUNT[roominess.toString()],
    borderColor: chartFlatsColors[roominess.toString()].border,
    data: unref(dates).map(date => {
      const statuses = props.bulk.flats
        .filter(flat => flat.rooms.toString() === roominess)
        .map(flat => flat.getStatusOnDate(date))
        .filter(status => status !== null)

      return statuses.length
        ? statuses.filter(status => status !== FLAT_STATUS_SOLD).length
        : null
      }
    )
  }))

  return {
    datasets,
    labels: unref(labels)
  }
})
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center">
      <VIcon
        class="mr-1"
        color="grey-darken-2"
        size="24"
      >
        mdi-home
      </VIcon>

      <span>{{ bulk.block.name }} - {{ bulk.name }}</span>
    </VCardTitle>

    <VDivider></VDivider>

    <VCardText class="pa-0">
      <VExpansionPanels multiple>
        <VExpansionPanel>
          <VExpansionPanelTitle class="px-4" icon="mdi-cart">
            <VIcon
              class="mr-1"
              color="grey-darken-2"
            >
              mdi-currency-rub
            </VIcon>

            Цены
          </VExpansionPanelTitle>

          <VExpansionPanelText>
            <Chart
              :data="flatsPricesChart"
              :options="flatPricesChartOptions"
              type="line"
            ></Chart>
          </VExpansionPanelText>
        </VExpansionPanel>

        <VExpansionPanel>
          <VExpansionPanelTitle class="px-4" icon="mdi-cart">
            <VIcon
              class="mr-1"
              color="grey-darken-2"
            >
              mdi-cart
            </VIcon>

            Квартир в продаже [{{ bulk.flats.length }}]
          </VExpansionPanelTitle>

          <VExpansionPanelText>
            <Chart
              :data="flatsSellingChart"
              :options="baseChartOptions"
              type="line"
            ></Chart>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCardText>
  </VCard>
</template>
