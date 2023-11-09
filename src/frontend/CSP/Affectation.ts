import type { JSONPrimitives } from "../JSON"
import { Domain } from "./Domain"
import { Variable } from "./Variable"

export type AffectationProps<T extends JSONPrimitives = JSONPrimitives> = {
    readonly variables: Map<string, Variable<T>>
    readonly values?: {readonly [variable: string]: T}
}

export class Affectation<T extends JSONPrimitives = JSONPrimitives> {
    private static _generating: boolean = false

    private constructor (
        private readonly _variables: Map<string, Variable<T>>,
        private readonly _values: {[variableName: string]: T},
    ) {}

    getValue(variableName: string): T | undefined {
        return this._values[variableName]
    }
    setValue(variableName: string, value: T) {
        if (this._variables.get(variableName)?.domain.has(value)) {
            this._values[variableName] = value
        }
    }
    unsetValue(variableName: string) {
        if (variableName in this._values) {
            delete this._values[variableName]
        }
    }

    static stopGenerating() {
        Affectation._generating = false
    }
    
    static *generate<T extends JSONPrimitives = JSONPrimitives>(
        variables: Map<string, Variable<T>>,
    ): Generator<Affectation<T>> {
        /**
         * Si on générait déjà des affectations, on ne va pas plus loin
         */
        if (Affectation._generating) {
            return
        }
        Affectation._generating = true
        /**
         * Génère la première affectation possible
         */
        let maxIdxSum = 0
        const combination: [string, number, T[]][] = []
        for (const variableName of variables.keys()) {
            const variable = variables.get(variableName) as Variable<T>
            const domainValues = variable.domain.toJSON()
            if (domainValues.length === 0) {
                return
            }
            maxIdxSum += domainValues.length
            combination.push([variableName, 0, domainValues])
        }
        /**
         * Génération
         */
        let idxSum = 0
        while (idxSum < maxIdxSum && this._generating) {
            const values: Record<string, T> = {}
            for (const [vName, idx, domain] of combination) {
                values[vName] = domain[idx]
            }
            yield Affectation.create<T>({variables, values})
            idxSum = 0
            for (let i = combination.length - 1; i >= 0; i--) {
                const [_, idx, domain] = combination[i]
                if (idx < domain.length - 1) {
                    idxSum += combination[i][1]++
                    break
                } else {
                    combination[i][1] = 0
                }
            }
        }
    }

    static create<T extends JSONPrimitives = JSONPrimitives>(props: AffectationProps<T>): Affectation<T> {
        return new Affectation<T>(
            props.variables,
            props.values ?? {},
        )
    }
}