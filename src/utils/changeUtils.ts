import {CashuMint, Proof, Token} from "@cashu/cashu-ts";
import {ChangeItem} from "@/types";



//Get formated and typed mints from localstorage
export function getMints(): string[] {
    return JSON.parse(localStorage.getItem("mints") ?? "[]") as string[];
}

//Get formated and typed proofs from localstorage
export function getProofs(): Proof[] {
    return JSON.parse(localStorage.getItem("proofs") ?? "[]") as Proof[];
}


export function removeUsedProofs(usedProofs: Proof[]) {
    const localProofs = getProofs();
    const updatedProofs = localProofs.filter((proof: Proof) => {
        return !usedProofs.includes(proof);
    })
    localStorage.setItem("proofs", JSON.stringify(updatedProofs));
}

//Get proofs from localstorage for given mint
export async function getChangeForMint(mintUrl: string) {
    const localMints = getMints();
    if (localMints.includes(mintUrl)) {
        const { keysets } = await new CashuMint(mintUrl).getKeySets();
        const localProofs = getProofs();
        return localProofs.filter((proof) =>
            keysets.some((keyset) => keyset.id === proof.id)
        );
    }
    return [];
}

//Get all stored proofs and mints
export async function getFullChange(): Promise<ChangeItem[]> {
    const localMints = getMints();
    const localProofs = getProofs();

    const changes = await Promise.all(
        localMints.map(async (mint) => {
            try {
                const mintProofsMap = new Map<string, number>();
                const { keysets } = await new CashuMint(mint).getKeySets();
                localProofs.forEach(proof => {
                    const matchingKeyset = keysets.find(keyset => keyset.id === proof.id);
                    if (matchingKeyset) {
                        const currentAmount = mintProofsMap.get(matchingKeyset.unit) || 0;
                        mintProofsMap.set(matchingKeyset.unit, currentAmount + proof.amount);
                    }
                });
                return Array.from(mintProofsMap.entries()).map(([unit, amount]) => ({
                    mint,
                    unit,
                    amount
                }));
            } catch (error) {
                console.error(`Error processing mint ${mint}:`, error);
                return [];
            }
        })
    );

    return changes.flat().sort((a, b) => {
        const mintCompare = a.mint.localeCompare(b.mint);
        if (mintCompare !== 0) return mintCompare;
        return a.unit.localeCompare(b.unit);
    });
}

//Save mint to localStorage
export function storeMint(mintUrl: string) {
    const localMints = getMints();
    if (!localMints.includes(mintUrl)) {
        localStorage.setItem("mints", JSON.stringify([...localMints, mintUrl]));
    }
}

//Save proofs to localStorage
export function storeProofs(proofs: Proof[]) {
        const existingProofs: Proof[] = JSON.parse(localStorage.getItem("proofs") || "[]");
        const proofsToAdd = proofs.filter(proof => !existingProofs.includes(proof));
        const updatedProofs = [...existingProofs, ...proofsToAdd];
        localStorage.setItem("proofs", JSON.stringify(updatedProofs));
}

//Merge proofs from change with token proofs
export async function mergeChange(token:Token) {
    try {
        if (!token) {
            throw new Error("Token missing")
        }
        const {unit, mint} = token;
        const cashuMint = new CashuMint(mint);

        // Get change and keysets for provided mint
        const change = await getChangeForMint(mint) || [];
        const {keysets} = await cashuMint.getKeySets();

        // filter proofs by already used unit
        const matchingKeysets = keysets.filter(keyset => keyset.unit === unit);

        const validChangeProofs = change.filter(changeProof =>
            matchingKeysets.some(keyset => keyset.id === changeProof.id)
        );

        return [...token.proofs, ...validChangeProofs];
    } catch (error) {
        console.log(error)
        return token.proofs; // In case of error - return just input
    }
}


