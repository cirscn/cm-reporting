import type { CrtVersionOverride } from '../base'
import { CRT_Q2_OPTIONS_DEFAULT } from '../base'

export const crt_2_2: CrtVersionOverride = {
  id: '2.2',
  q2Options: CRT_Q2_OPTIONS_DEFAULT,
  companyQuestionsGOptions: [
    { value: 'Yes, CRT', labelKey: 'options.yesCrtTemplate' },
    { value: 'Yes, Using Other Format (Describe)', labelKey: 'options.yesOtherFormatTitle' },
    { value: 'No', labelKey: 'options.no' },
  ],
  companyQuestionsGCommentRequiredWhen: ['Yes, Using Other Format (Describe)'],
}
