const DECLARATION_PANEL_KEYS = Object.freeze({
  companyInfo: 'companyInfo',
  mineralsScope: 'mineralsScope',
  companyQuestions: 'companyQuestions',
})

function getDeclarationPanelKeyForFieldPath(fieldPath: string | null) {
  if (!fieldPath) {
    return DECLARATION_PANEL_KEYS.companyInfo
  }

  const fieldGroup = fieldPath.split('.')[0]
  if (fieldGroup === 'companyQuestions') {
    return DECLARATION_PANEL_KEYS.companyQuestions
  }

  if (
    fieldGroup === 'questions' ||
    fieldGroup === 'questionComments' ||
    fieldGroup === 'mineralsScope' ||
    fieldGroup === 'selectedMinerals' ||
    fieldGroup === 'customMinerals'
  ) {
    return DECLARATION_PANEL_KEYS.mineralsScope
  }

  return DECLARATION_PANEL_KEYS.companyInfo
}

export function getActiveDeclarationPanelKeys({
  focusFieldPath,
  ignoredFocusFieldPath,
  manualActivePanelKeys,
}: {
  focusFieldPath: string | null
  ignoredFocusFieldPath: string | null
  manualActivePanelKeys: string[]
}) {
  if (focusFieldPath && ignoredFocusFieldPath !== focusFieldPath) {
    return [getDeclarationPanelKeyForFieldPath(focusFieldPath)]
  }

  return manualActivePanelKeys
}

export const DECLARATION_PANEL_KEY_VALUES = DECLARATION_PANEL_KEYS
