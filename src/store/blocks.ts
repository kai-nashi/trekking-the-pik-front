// Utilities
import { defineStore } from 'pinia'

import {ApiFlat, ApiFlatJson} from "@/assets/api/types";
import {Ref, ref} from "vue";


export type Block = {
  id: number,
  bulks: Array<Bulk>
  name: string,
  slug: string
}

export type Bulk = {
  block: Block,
  name: string,
  flats: Array<ApiFlat>
}


export const usePikStore = defineStore('pik', () => {
  const blocks: Ref<Array<Block>> = ref([])
  const isLoading: Ref<boolean> = ref(false)

  function update(flats: Array<ApiFlatJson>) {
    flats.forEach(apiFlatJson => {
      let block = blocks.value.find(block => block.id === apiFlatJson.block_id)
      if (!block) {
        block = {
          id: apiFlatJson.block_id,
          bulks: [],
          name: apiFlatJson.block_name,
          slug: apiFlatJson.block_slug,
        }

        blocks.value.push(block)
      }

      let bulk = block.bulks.find(bulk => bulk.name === apiFlatJson.bulk_name)
      if (!bulk) {
        bulk = {
          block: block,
          flats: [],
          name: apiFlatJson.bulk_name
        }

        block.bulks.push(bulk)
      }

      let flat = bulk.flats.find(flat => flat.id === apiFlatJson.id)
      if (flat) {
        flat.update(apiFlatJson)
      } else {
        flat = ApiFlat.fromJson(apiFlatJson)
        bulk.flats.push(flat)
      }
    })
  }

  return {
    blocks,
    isLoading,
    update
  }
})
