import type { SmelterRow } from '@core/types/tableRows'

import { clearRemovedMineSmelters } from './mineCascade'
import type { TemplateActionContext, TemplateStoreActions } from './templateStoreTypes'

function setSmelters(context: TemplateActionContext, rows: SmelterRow[]) {
  const { set, get, versionDef, scheduleValidation } = context
  if (get().readOnly) return
  set((state) => {
    if (versionDef.mineList.available) {
      state.mineList = clearRemovedMineSmelters({
        rows: state.mineList, previousSmelters: state.smelterList, nextSmelters: rows,
      })
    }
    state.smelterList = rows
    state.isDirty = true
  })
  scheduleValidation()
}

export function createListActions(context: TemplateActionContext): Pick<
  TemplateStoreActions, 'setMineralsScope' | 'setSmelterList' | 'setMineList' | 'setProductList'
> {
  const { set, get, scheduleValidation } = context
  return {
    setMineralsScope: (rows) => {
      if (get().readOnly) return
      set({ mineralsScope: rows, isDirty: true })
      scheduleValidation()
    },
    setSmelterList: (rows) => setSmelters(context, rows),
    setMineList: (rows) => {
      if (get().readOnly) return
      set({ mineList: rows, isDirty: true })
      scheduleValidation()
    },
    setProductList: (rows) => {
      if (get().readOnly) return
      set({ productList: rows, isDirty: true })
      scheduleValidation()
    },
  }
}
