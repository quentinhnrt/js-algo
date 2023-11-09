import type {Domain, Variable} from "./CSP"

export type SudokuValues = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type SudokuDomain = Domain<SudokuValues>
export type SudokuCell = Variable<SudokuValues>
