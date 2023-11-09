type UContrainte = (V: any) => boolean
type BContrainte = (V1: any, V2: any) => boolean

const differentDe: BContrainte = (case1: number, case2: number) => {
    return case1 !== case2
}

const ligne: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1]
const contrainteLigne: BContrainte[] = []

for (let case1 = 0; case1 < ligne.length; case1++) {
    for (let case2 = 0; case2 < ligne.length; case2++) {
        if (case1 !== case2) {
            contrainteLigne.push(() => differentDe(ligne[case1], ligne[case2]))
            contrainteLigne.push(() => differentDe(ligne[case2], ligne[case1]))
        }
    }
}