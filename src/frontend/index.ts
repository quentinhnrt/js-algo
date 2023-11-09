/// <reference lib="dom" />

import {wsInit} from "./io"
import {App} from "./App"

const SUDOKU_CANVAS_ID = "sudokuCanvas"
const SOLUTION_SPACE_SIZE_P_ID = "solutionsSpaceSize"
const RESET_BTN_ID = "reset"
const GT_BTN_ID = "GT"
const BT_BTN_ID = "BT"
const NC_CHECKBOX_ID = "NC"
const ACNONE_RADIO_ID = "ACNone"
const AC1_RADIO_ID = "AC1"
const AC3_RADIO_ID = "AC3"
const TESTED_SOLUTIONS_P_ID = "testedSolutions"
const PRUNED_SOLUTIONS_P_ID = "prunedSolutions"
const PROGRESS_P_ID = "progress"
const TIMELEFT_P_ID = "timeleft"

wsInit()

const app = App.create({
  canvasId: SUDOKU_CANVAS_ID,
  solutionSpaceSizePId: SOLUTION_SPACE_SIZE_P_ID,
  resetBtnId: RESET_BTN_ID,
  gtBtnId: GT_BTN_ID,
  btBtnId: BT_BTN_ID,
  ncCheckboxId: NC_CHECKBOX_ID,
  acNoneRadioId: ACNONE_RADIO_ID,
  ac1RadioId: AC1_RADIO_ID,
  ac3RadioId: AC3_RADIO_ID,
  testedSolutionsPId: TESTED_SOLUTIONS_P_ID,
  prunedSolutionsPId: PRUNED_SOLUTIONS_P_ID,
  progressPId: PROGRESS_P_ID,
  timeleftPId: TIMELEFT_P_ID,
})
app && app.start()
