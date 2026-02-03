import type { CrtVersionOverride } from '../base'
import { CRT_Q2_OPTIONS_DEFAULT, CRT_YES_NO_OPTIONS } from '../base'

export const crt_2_2: CrtVersionOverride = {
  id: '2.2',
  q2Options: CRT_Q2_OPTIONS_DEFAULT,
  companyQuestionsGOptions: CRT_YES_NO_OPTIONS,
  companyQuestionsGCommentRequiredWhen: [],
}
