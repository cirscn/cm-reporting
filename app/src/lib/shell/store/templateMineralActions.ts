import { applyRemovedMineralsCascade, resolveRemovedMinerals } from './mineralCascade'
import type { TemplateActionContext, TemplateStoreActions } from './templateStoreTypes'

export function createMineralActions(context: TemplateActionContext): Pick<
  TemplateStoreActions, 'setSelectedMinerals' | 'setCustomMinerals'
> {
  const { set, get, versionDef, scheduleValidation } = context
  return {
    setSelectedMinerals: (minerals) => {
      if (get().readOnly) return
      set((state) => {
        const removed = resolveRemovedMinerals({
          versionDef,
          prevSelectedMinerals: state.selectedMinerals,
          nextSelectedMinerals: minerals,
          prevCustomMinerals: state.customMinerals,
          nextCustomMinerals: state.customMinerals,
        })
        state.selectedMinerals = minerals
        applyRemovedMineralsCascade(state, removed)
        state.isDirty = true
      })
      scheduleValidation()
    },
    setCustomMinerals: (minerals) => {
      if (get().readOnly) return
      set((state) => {
        const removed = resolveRemovedMinerals({
          versionDef,
          prevSelectedMinerals: state.selectedMinerals,
          nextSelectedMinerals: state.selectedMinerals,
          prevCustomMinerals: state.customMinerals,
          nextCustomMinerals: minerals,
        })
        state.customMinerals = minerals
        applyRemovedMineralsCascade(state, removed)
        state.isDirty = true
      })
      scheduleValidation()
    },
  }
}
