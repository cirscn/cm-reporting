import type { CrtVersionOverride } from '../base'
import { CRT_Q2_OPTIONS_221 } from '../base'

export const crt_2_21: CrtVersionOverride = {
  id: '2.21',
  q2Options: CRT_Q2_OPTIONS_221,
  companyQuestionsGOptions: [
    { value: 'Yes, CRT', labelKey: 'options.yesCrtTemplate' },
    { value: 'Yes, Using Other Format (Describe)', labelKey: 'options.yesOtherFormatTitle' },
    { value: 'No', labelKey: 'options.no' },
  ],
  companyQuestionsGCommentRequiredWhen: ['Yes, Using Other Format (Describe)'],
}
