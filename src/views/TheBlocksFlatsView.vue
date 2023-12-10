<script lang="ts" setup>
import {Block, Bulk, usePikStore} from "@/store/blocks";
import {computed, ComputedRef, onMounted, ref, Ref, unref} from "vue";
import BulkFlatsSummaryCard from "@/components/Blocks/Bulks/BulkFlatsSummaryCard.vue";

const blocks: Ref<Array<Block>> = ref([])
const bulks: ComputedRef<Array<Bulk>> = computed(() => {
  return unref(blocks).map(block => block.bulks).flat()
})
const pik = usePikStore()

onMounted(async () => {
  pik.isLoading = true

  const response = await fetch(import.meta.env.BASE_URL + 'flats.json');
  const flats = await response.json();
  pik.update(flats)

  pik.isLoading = false
})
</script>

<template>
  <VContainer>
    <VSheet class="bg-transparent">
      <VForm>
        <VSelect
          v-model="blocks"
          :items="pik.blocks"
          hide-details
          label="Жилой комплекс"
          item-title="name"
          chips
          closable-chips
          counter
          multiple
          single-line
          solo
          return-object
        ></VSelect>
      </VForm>

      <BulkFlatsSummaryCard
        v-for="bulk in bulks"
        :key="`${bulk.block.slug}-${bulk.name}`"
        :bulk="bulk"
        class="my-4"
      ></BulkFlatsSummaryCard>
    </VSheet>
  </VContainer>
</template>
