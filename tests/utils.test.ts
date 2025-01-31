import {CashuMint, CashuWallet, getDecodedToken, Proof} from "@cashu/cashu-ts";
import {expect} from "chai";
import {getSatPerUnit, getSatValue} from "@/utils/cashuUtils";
import {fiat, Invoice, LightningAddress} from "@getalby/lightning-tools";
import {
    getChangeForMint,
    getFullChange,
    getMints,
    getProofs,
    mergeChange,
    removeUsedProofs,
    storeMint, storeProofs
} from "@/utils/changeUtils";
import {createInvoice, fetchLNURLData} from "@/utils/lightningUtils";
import chaiAsPromised from "chai-as-promised";
import chai from "chai";

chai.use(chaiAsPromised);
describe("cashuUtils", () => {
    describe('Get satoshi value of single unit', () => {
        it('Correctly gets value from one sat token: ', async () => {
            const singleUnitToken = getDecodedToken("cashuBo2FteBxodHRwczovL3N0YWJsZW51dC51bWludC5jYXNoYXVjc2F0YXSBomFpSABBRr30qa-rYXCBo2FhAWFzeEA4Yjk0N2VlMDlmMmNlMDcxNWYyYWEyNDk3NGE4YTQxZDJkMjZhNDg2Y2NmNDRmY2RhNjVmMDE3Y2FhYzQwM2IwYWNYIQNvu8aKC4tQVq-Bxjto5nS8rApH-aLf79VV7eeq7QW7pA")
            const cashumint = new CashuMint(singleUnitToken.mint)
            const wallet = new CashuWallet(cashumint, {unit: singleUnitToken.unit})
            const rate = await getSatPerUnit(wallet);
            expect(rate).to.equal(1);
        })

    })

    describe('Get satoshi value of token', () => {
        it('Correctly gets value from one sat token: ', async () => {
            const token = getDecodedToken("cashuBo2FteBxodHRwczovL3N0YWJsZW51dC51bWludC5jYXNoYXVjc2F0YXSBomFpSABBRr30qa-rYXCHo2FhAmFzeEBkOWRlZjBiZjAxOGMxYTIxMjNjNTQ0ZWQ5ZDc5ZDVhM2U4MWM3OTlhMTM2OGYyOTJlMTc3YzM4NDFiOGE3MDA2YWNYIQOxjL5AVi1pcHsb9jKI1jSl-bHTLU_LHFWIwLqwegIrK6NhYQJhc3hANDBlY2QzMzg0ODg3ZWMzZmFlNGNkM2JmYzY5OGViYWNiNjhlNTUyYjYzZDBiMmUzMjQwZTNjYjBjZGVhNDMxYWFjWCEDDTdvjfqTsjE4mmubrzZsdpMeqiBiQ-eLcRXyXzfY8W2jYWECYXN4QDdjN2FhZTczMWY2Y2ZhNmQ0ZTY4NjhmYzNjNTJmZjQ2NTRiOGZlY2M4Njc1ODE0MmVlZmZlY2Y3YjU3OTU4NjZhY1ghAmmFyx4FV3k7-aMTOjCTzN4s-3ufWHJ-gZ0veXE7Zb4Ao2FhAWFzeEA2M2VkZTJmYTVmNWI2MTcxMjA0OWE0ZDhiMDQ3NzI4OWY3N2NlM2YyMzQwNjg4MzE3ZDdiMzM1MTVmZWQ2OTQ3YWNYIQIql0sDHhTy7g3oI0pLgP-RwHKS8254lPebchqtBBWZD6NhYQFhc3hANjFlYjNlOThiZTA3NzMwNzcxOWRiZmM4NjM4NGIzNThmZWQxMmU5NDk3NjY4ZTZiNGZmOTdmNWZhYTc3NjExZWFjWCEC4yi5TKLFrxix89Q1aiRNK3FvU3yIYshVDmQJ4E02OsWjYWEBYXN4QDM5MGExMzM2YjNjNTFjNDUzODE1YmU0ZTJjNDMxNjExYWE2NDE0YWM2YzgyOTk3OTdmZTM3YTJlNGIyMDc5YTZhY1ghAx_bjmV11S_JOVMNF5o5dMPSixcSLRUpeSl83BGGhDmko2FhAWFzeEAwNjNlZWM1YWIzMGJhYWIwYjM0ZjI5ZWMxYTA1MGQ2ZGM2MWQyYTY0YmYzMTY1OGRiZWFmNTc0ZGNjZmQ2YTU3YWNYIQOCd0arO7f5ypvEUGgZU3Jv52V0lU9R0Xa1rm9yZx3gxA")
            const cashumint = new CashuMint(token.mint)
            const wallet = new CashuWallet(cashumint, {unit: token.unit})
            const value = await getSatValue(wallet, token);
            expect(value).to.equal(10);
        })

        it('Correctly gets usd denominated token value in sat', async () => {
            const token = getDecodedToken("cashuBo2FteBxodHRwczovL3N0YWJsZW51dC51bWludC5jYXNoYXVjdXNkYXSBomFpSAD2hOihuoaWYXCSo2FhEGFzeEA3ZTAzZTkwYTQ4YjQzY2FjZWNiZTMwNDUzNDRjOTdlYjZiYTJlNDgzNzEyOTlhOTEyZjk0MGE4ZWIxYjgzZjQ4YWNYIQPt3_YI1Wwjo4uUxPdJJqgLfp14EvkVTf-KmA0mMoqWhqNhYRBhc3hAMjg0NTdmMzRlOWVkZTZmODgzMWFhOTY5YTk3NDkwM2ZhZDdiZDFlNTJlZjBiZDk4MWE5NmJhNGVkMmUzZGM3NmFjWCEDm1SUEM5kOe8pR0rDUx31fdVnw4N2Fas2aSwoiIRtAgqjYWEQYXN4QDg3YTZhZTRkOGEzNDk5MjIwNDhhODMyZTBjYmZlZWJjMDU4MTFkOTQzYTNiYzMxOGY0NDg0MGQ1OTE4NTZlNzRhY1ghAynlZr9kXkvJH3BUVkwgnTPBZCyEMpdc83fRP5b5QQN4o2FhCGFzeEAxYTE0Zjc4ZTYyMDI4MDE0NzQ5NTJlY2MyMGI2MjdlYjVlZGRmNWE0OGRhMTJlZTk5ZmY5ODMwNjJhZmM2ZWQyYWNYIQMyZ-YPWreFGAeXJOY2S4Qv4afWs_Ny2LzSueUwSi1SMaNhYQhhc3hAM2NiMjg4MzAyZDk5ZmE0ZGFkOTA0NzFkODVhYTJlNDNiNTFjODY5ZWVkNGFkY2E3NzJmNjkxZTE4YmUzMjY2OWFjWCEDFZcCxbznMqBijvcl6TlYBqSjEcaN7c0YZhOogX-_-YSjYWEIYXN4QGIwYTc0MDM2YmRmYWRlYjg3ZDEzZWY3OTg1ZjFmY2YyODEyMmRlNjczMTY0MTZjNjQ4YzRmYjc4ODVhMTVlNjJhY1ghAzduCOLxtV7JNXdfo47j7uQqh4SNOStdOLfQZw6taLhno2FhBGFzeEA3MzA1MjdjNzJkYmI0MzU3NmI1NDBjMTRlMzBhZjI1ZGY5ZDg0ZTdmZGI3NzZmNWM4YzEzNThiNmI4ODAxZTY5YWNYIQL0kUtWuDAH7P4VhcA8vmMYAk5jSH-LaJD8_kdr_o0OVaNhYQRhc3hAMzhhMDE4YWY3MWYwYjI5ZWMwZmU0ZDM1NWZmYjM0ZmEzNTFhYjVmMTc0YTczYjJiZjhjMGYxNzJhM2FmZDE0ZGFjWCEDRnsfuCTqZno2RWAvi1y9djRnpMLoVWHKRawqx2010myjYWEEYXN4QDdiNmFhNTVmODQzNDQzODE2MGZjOTE2MzFjMzU5NjMxMWE4ZTc1Mzk4NmRjNzBjNjA3YzI0ZmI5OGEwMjIzODdhY1ghA3U0Zz3nVGoRLKCsak3NLxerf3WU73nzsaFv4b3BmsBMo2FhBGFzeEA0ZmRiZGYzODZmZTYyMTQ4ZTNlOGIzODMwMDk2MDQ1OWNmMTRlZmVhMmRmOTg4ZmZjMzBiN2I3MmFlNjY2OGE3YWNYIQOrqzP-n1y8scAYk_2pQxm4DScqUtiDqp_WBJPlU2aRR6NhYQJhc3hANjMwNTQ3ZjY2ZDFhZGY4OGNkYjMxMGUwNDBkNzgxNGZkNWJiM2ZmOGVjODc2ODc2MDlmMjEyNThhYjcxYjlmMWFjWCEDKTEVq-Q5A_IDcW8tvByodmC3jFKSBChbs9YEpjrkDAyjYWECYXN4QGU1MWMzN2NlYzVhYjEyNTBlYWQwODFhY2ZlNmQxODM2MWMxN2Q1ZGYwZDVlZmFjNWYxMTYxZWMzNDIzNDhjMmVhY1ghAzVHF_03-rRbRKKhbrKHhncKx02Dhod5hNuA-z8I0oEVo2FhAmFzeEBhNzYzNmEzN2Q1ZGEyMDEzNGU0ZjA2ZjRkZjAxMWE2MGJlMTJiOGFiZGRkODkyMzA1ZmQ4NzY3OWJkMDAxNWE4YWNYIQKi21QrVokb1Y-VrjBQ8bMJ3EV0yd2vpldWPkQZo-pinqNhYQJhc3hAMTFmOWU1YmRkMWQ2ZDQ4OTBmNzVjYzAyZjg3YzcyNmViMTZmNWU5YTFiNWNiODA1NWI1YmM0Mjg1NjQxOTY3MGFjWCECHKmiSZZgPdKpjoGfiZtXcThTQSyVMmjE1X-FcwnnutujYWEBYXN4QDFkODczYmIzZmM1ZjIzOWEyMzNjZmY3YWM3ZmFlNzYyYzIwOTM2ZjIxOTc0NTc4MmU3ZjYyZGQ5MjQyYTFkNDdhY1ghAsDR9J1XOMJ6NYYS2B1OnR7iOKUQyBntMFwtHG-d4eIdo2FhAWFzeEA4NjExNzdmYTAxY2Y1ZTg1Mzk0ZDQ1NDUxMWM4NDUyM2ZhNDYyOWQzYTY4MTEzNmFjZjZjNmM2MzQ5ZjI3OTdkYWNYIQK9o25I6kUTyjUb4hB30vSNb_LpbZlZtaHNdDwkkc6TWaNhYQFhc3hAZTkyMmYxMmM2MzBhYzk4Y2ZlNDA0NDFjNWQwN2U2MzgxZjI5MmI3NzEyZTI1MzBlZGU0ODQ4YjRjYWVmN2QyY2FjWCECWV5nOHyceHPIQcWRj-0BeCkBOztEfwKueKSgs5SuAsWjYWEBYXN4QDYyY2EyYzc4MzU0NjdjODI0YWQ4ZWY0N2ZhYjc0MDJjNDEyOWQ3OGU2YWI2NTEyMTE0NTliODY5ZThiMTQ3NDZhY1ghAqGlj2XRVVfR4aELrJVMEErczuzWQPBtSRq5orqBdkkO")
            const estimatedValue = await fiat.getSatoshiValue({amount: 1, currency: "usd"})
            const cashumint = new CashuMint(token.mint)
            const wallet = new CashuWallet(cashumint, {unit: token.unit})
            const rate = await getSatValue(wallet, token);
            //estimated 5% - mint price can be different from used price api
            expect(rate).to.approximately(estimatedValue, rate * 5 / 100);
        })
    })
})

describe("changeUtils", () => {
    // Mock localStorage
    const localStorageMock = (() => {
        let store: Record<string, string> = {};

        return {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => {
                store[key] = value;
            },
            clear: () => {
                store = {};
            },
            removeItem: (key: string) => {
                delete store[key];
            },
        };
    })();

    Object.defineProperty(global, "localStorage", {
        value: localStorageMock,
    });

    describe("getMints", () => {
        beforeEach(() => {
            localStorage.clear(); // Czyść przed każdym testem
        });

        it("should return an empty array if localStorage has no mints", () => {
            const result = getMints();
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(result).to.be.an("array").that.is.empty;
        });

        it("should return an array of strings when mints are present in localStorage", () => {
            localStorage.setItem("mints", JSON.stringify(["mint1", "mint2", "mint3"]));

            const result = getMints();
            expect(result).to.be.an("array").that.deep.equals(["mint1", "mint2", "mint3"]);
        });

    });

    describe("getProofs", () => {
        beforeEach(() => {
            localStorage.clear();
        })
        it("should return an empty array if localStorage has no proofs", () => {
            const result = getProofs();
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(result).to.be.an("array").that.is.empty;
        })

        it("should return an array of strings when proofs are present in localStorage", () => {
            localStorage.setItem("mints", JSON.stringify(["mint1", "mint2"]));
            const result = getMints()
            expect(result).to.be.an('array').that.deep.equals(["mint1", "mint2"]);
        })
    })

    describe("removeUsedProofs", () => {
        beforeEach(() => {
            localStorage.setItem("proofs", JSON.stringify(["proof1", "proof2", "proof3", "proof4", "proof5"]));
        })

        it("should remove given proofs from localStorage", () => {
            removeUsedProofs(['proof1', "proof3", "proof5"] as unknown as Proof[]);
            const proofs = getProofs();
            expect(proofs).to.be.an('array').that.deep.equals(['proof2', 'proof4']);
        })

        it("should remove nothing if provided an empty array", () => {
            removeUsedProofs([])
            const proofs = getProofs();
            expect(proofs).to.be.an('array').that.deep.equals(["proof1", "proof2", "proof3", "proof4", "proof5"]);
        })

        it("should do nothing with proofs different than these from localStorage", () => {
            removeUsedProofs(['bread', "milk", "john pork"] as unknown as Proof[]);
            const proofs = getProofs();
            expect(proofs).to.be.an('array').that.deep.equals(["proof1", "proof2", "proof3", "proof4", "proof5"])
        })

        it('should work with proofs present and not present in localStorage ', () => {
            removeUsedProofs(['bread', "milk", "john pork", "proof2", "proof3", "proof4"] as unknown as Proof[]);
            const proofs = getProofs();
            expect(proofs).to.be.an('array').that.deep.equals(["proof1", "proof5"])
        })
    })

    describe("storeMint", () => {
        beforeEach(() => {
            localStorage.clear();
        });

        it("should add new mint to empty localStorage", () => {
            storeMint("https://newmint.com");
            const mints = getMints();
            expect(mints).to.deep.equal(["https://newmint.com"]);
        });

        it("should not add duplicate mint", () => {
            localStorage.setItem("mints", JSON.stringify(["https://existingmint.com"]));
            storeMint("https://existingmint.com");
            const mints = getMints();
            expect(mints).to.deep.equal(["https://existingmint.com"]);
        });
    });

    describe("storeProofs", () => {
        beforeEach(() => {
            localStorage.clear();
        });

        it("should store proofs in empty localStorage", () => {
            const newProofs = ["proof1","proof2"];
            storeProofs(newProofs as unknown as Proof[]);
            const storedProofs = getProofs();
            expect(storedProofs).to.deep.equal(newProofs);
        });

        it("should append proofs to existing ones", () => {
            const existingProofs = ["proof1", "proof2" ];
            const newProofs = ["proof3", "proof4"];
            localStorage.setItem("proofs", JSON.stringify(existingProofs));
            storeProofs(newProofs as unknown as Proof[]);
            const storedProofs = getProofs();
            expect(storedProofs).to.deep.equal([...existingProofs, ...newProofs]);
        });

        it("should not duplicate proofs", ()=>{
            const existingProofs = ["proof1", "proof2" ];
            const newProofs = ["proof1", "proof2"];
            localStorage.setItem("proofs", JSON.stringify(existingProofs));
            storeProofs(newProofs as unknown as Proof[]);
            const storedProofs = getProofs();
            expect(storedProofs).to.deep.equal(existingProofs);
        })
    });

    describe("getChangeForMint", () => {
        beforeEach(() => {
            localStorage.setItem("proofs", JSON.stringify([{
                amount: 2,
                //valid keyset for https://8333.space:3338
                id: 'I2yN+iRYfkzT',
                secret: '407915bc212be61a77e3e6d2aeb4c727980bda51cd06a6afc29e2861768a7837',
                C: '02bc9097997d81afb2cc7346b5e4345a9346bd2a506eb7958598a72f0cf85163ea'
            },{
                amount: 8,
                //valid keyset for https://8333.space:3338
                id: '00759e3f8b06b36f',
                secret: 'fe15109314e61d7756b0f8ee0f23a624acaa3f4e042f61433c728c7057b931be',
                C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
            }, {
                amount: 8,
                id: 'abcdasdda',
                secret: 'fe15109314e61d7756b0f8ee0f23a624acaa3f4e042f61433c728c7057b931be',
                C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
            },  {
                amount: 8,
                id: 'gamsadasdasdma',
                secret: 'fe15109314e61d7756b0f8ee0f23a624acaa3f4e042f61433c728c7057b931be',
                C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
            }]));
            localStorage.setItem("mints", JSON.stringify(["https://8333.space:3338", "https://stablenut.umint.cash"]));
        })

        it("should return valid proofs only for given mint ", async () => {
            const proofs = await getChangeForMint("https://8333.space:3338")
            expect(proofs).to.be.an('array').that.deep.equals([{
                amount: 2,
                id: 'I2yN+iRYfkzT',
                secret: '407915bc212be61a77e3e6d2aeb4c727980bda51cd06a6afc29e2861768a7837',
                C: '02bc9097997d81afb2cc7346b5e4345a9346bd2a506eb7958598a72f0cf85163ea'
            }, {
                amount: 8,
                id: '00759e3f8b06b36f',
                secret: 'fe15109314e61d7756b0f8ee0f23a624acaa3f4e042f61433c728c7057b931be',
                C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
            }]);
        });

        it("should return empty array if mint is unknown", async () => {
            const proofs = await getChangeForMint("https://definetly.unknown.mint");
            expect(proofs).to.be.an('array').that.deep.equals([]);
        })

        it("should return empty array if no change for valid mint", async ()=>{
          const proofs = await getChangeForMint("https://stablenut.umint.cash");
          expect(proofs).to.be.an('array').that.deep.equals([])
        })
    })

    describe("getFullChange", () => {
            beforeEach(() => {
                localStorage.clear();
                localStorage.setItem("proofs", JSON.stringify([{
                    amount: 2,
                    //valid keyset for https://8333.space:3338
                    id: 'I2yN+iRYfkzT',
                    secret: '407915bc212be61a77e3e6d2aeb4c727980bda51cd06a6afc29e2861768a7837',
                    C: '02bc9097997d81afb2cc7346b5e4345a9346bd2a506eb7958598a72f0cf85163ea'
                },{
                    amount: 8,
                    //valid keyset for https://8333.space:3338
                    id: '00759e3f8b06b36f',
                    secret: 'fe15109314e61d7756b0f8ee0f23a624acaa3f4e042f61433c728c7057b931be',
                    C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
                }, {
                    amount: 8,
                    //valid keyset for https://stablenut.umint.cash
                    id: '00f684e8a1ba8696',
                    secret: 'knjhgvcfgvhbjnk',
                    C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
                },  {
                    amount: 8,
                    //valid keyset for https://stablenut.umint.cash
                    id: '004146bdf4a9afab',
                    secret: 'mknjhgcfygvuhbijnok',
                    C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
                }]));
                localStorage.setItem("mints", JSON.stringify(["https://8333.space:3338", "https://stablenut.umint.cash"]));
            })

        it("should return empty array when no mints in localStorage", async () => {
            localStorage.clear();
            const result = await getFullChange();
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(result).to.be.an('array').that.is.empty;
        });

        it("should aggregate proofs by mint and unit", async () => {
            const result = await getFullChange();
            expect(result).to.deep.equal([
                { mint: 'https://8333.space:3338', unit: 'sat', amount: 10 },
                { mint: 'https://stablenut.umint.cash', unit: 'sat', amount: 8 },
                { mint: 'https://stablenut.umint.cash', unit: 'usd', amount: 8 }
            ])
        });
    });

    describe("mergeChange", () => {

        it("should return only input proofs when token is missing", async () => {
            localStorage.clear();
            const token = getDecodedToken('cashuBo2FteBxodHRwczovL3N0YWJsZW51dC51bWludC5jYXNoYXVjdXNkYXSBomFpSAD2hOihuoaWYXCSo2FhEGFzeEA3ZTAzZTkwYTQ4YjQzY2FjZWNiZTMwNDUzNDRjOTdlYjZiYTJlNDgzNzEyOTlhOTEyZjk0MGE4ZWIxYjgzZjQ4YWNYIQPt3_YI1Wwjo4uUxPdJJqgLfp14EvkVTf-KmA0mMoqWhqNhYRBhc3hAMjg0NTdmMzRlOWVkZTZmODgzMWFhOTY5YTk3NDkwM2ZhZDdiZDFlNTJlZjBiZDk4MWE5NmJhNGVkMmUzZGM3NmFjWCEDm1SUEM5kOe8pR0rDUx31fdVnw4N2Fas2aSwoiIRtAgqjYWEQYXN4QDg3YTZhZTRkOGEzNDk5MjIwNDhhODMyZTBjYmZlZWJjMDU4MTFkOTQzYTNiYzMxOGY0NDg0MGQ1OTE4NTZlNzRhY1ghAynlZr9kXkvJH3BUVkwgnTPBZCyEMpdc83fRP5b5QQN4o2FhCGFzeEAxYTE0Zjc4ZTYyMDI4MDE0NzQ5NTJlY2MyMGI2MjdlYjVlZGRmNWE0OGRhMTJlZTk5ZmY5ODMwNjJhZmM2ZWQyYWNYIQMyZ-YPWreFGAeXJOY2S4Qv4afWs_Ny2LzSueUwSi1SMaNhYQhhc3hAM2NiMjg4MzAyZDk5ZmE0ZGFkOTA0NzFkODVhYTJlNDNiNTFjODY5ZWVkNGFkY2E3NzJmNjkxZTE4YmUzMjY2OWFjWCEDFZcCxbznMqBijvcl6TlYBqSjEcaN7c0YZhOogX-_-YSjYWEIYXN4QGIwYTc0MDM2YmRmYWRlYjg3ZDEzZWY3OTg1ZjFmY2YyODEyMmRlNjczMTY0MTZjNjQ4YzRmYjc4ODVhMTVlNjJhY1ghAzduCOLxtV7JNXdfo47j7uQqh4SNOStdOLfQZw6taLhno2FhBGFzeEA3MzA1MjdjNzJkYmI0MzU3NmI1NDBjMTRlMzBhZjI1ZGY5ZDg0ZTdmZGI3NzZmNWM4YzEzNThiNmI4ODAxZTY5YWNYIQL0kUtWuDAH7P4VhcA8vmMYAk5jSH-LaJD8_kdr_o0OVaNhYQRhc3hAMzhhMDE4YWY3MWYwYjI5ZWMwZmU0ZDM1NWZmYjM0ZmEzNTFhYjVmMTc0YTczYjJiZjhjMGYxNzJhM2FmZDE0ZGFjWCEDRnsfuCTqZno2RWAvi1y9djRnpMLoVWHKRawqx2010myjYWEEYXN4QDdiNmFhNTVmODQzNDQzODE2MGZjOTE2MzFjMzU5NjMxMWE4ZTc1Mzk4NmRjNzBjNjA3YzI0ZmI5OGEwMjIzODdhY1ghA3U0Zz3nVGoRLKCsak3NLxerf3WU73nzsaFv4b3BmsBMo2FhBGFzeEA0ZmRiZGYzODZmZTYyMTQ4ZTNlOGIzODMwMDk2MDQ1OWNmMTRlZmVhMmRmOTg4ZmZjMzBiN2I3MmFlNjY2OGE3YWNYIQOrqzP-n1y8scAYk_2pQxm4DScqUtiDqp_WBJPlU2aRR6NhYQJhc3hANjMwNTQ3ZjY2ZDFhZGY4OGNkYjMxMGUwNDBkNzgxNGZkNWJiM2ZmOGVjODc2ODc2MDlmMjEyNThhYjcxYjlmMWFjWCEDKTEVq-Q5A_IDcW8tvByodmC3jFKSBChbs9YEpjrkDAyjYWECYXN4QGU1MWMzN2NlYzVhYjEyNTBlYWQwODFhY2ZlNmQxODM2MWMxN2Q1ZGYwZDVlZmFjNWYxMTYxZWMzNDIzNDhjMmVhY1ghAzVHF_03-rRbRKKhbrKHhncKx02Dhod5hNuA-z8I0oEVo2FhAmFzeEBhNzYzNmEzN2Q1ZGEyMDEzNGU0ZjA2ZjRkZjAxMWE2MGJlMTJiOGFiZGRkODkyMzA1ZmQ4NzY3OWJkMDAxNWE4YWNYIQKi21QrVokb1Y-VrjBQ8bMJ3EV0yd2vpldWPkQZo-pinqNhYQJhc3hAMTFmOWU1YmRkMWQ2ZDQ4OTBmNzVjYzAyZjg3YzcyNmViMTZmNWU5YTFiNWNiODA1NWI1YmM0Mjg1NjQxOTY3MGFjWCECHKmiSZZgPdKpjoGfiZtXcThTQSyVMmjE1X-FcwnnutujYWEBYXN4QDFkODczYmIzZmM1ZjIzOWEyMzNjZmY3YWM3ZmFlNzYyYzIwOTM2ZjIxOTc0NTc4MmU3ZjYyZGQ5MjQyYTFkNDdhY1ghAsDR9J1XOMJ6NYYS2B1OnR7iOKUQyBntMFwtHG-d4eIdo2FhAWFzeEA4NjExNzdmYTAxY2Y1ZTg1Mzk0ZDQ1NDUxMWM4NDUyM2ZhNDYyOWQzYTY4MTEzNmFjZjZjNmM2MzQ5ZjI3OTdkYWNYIQK9o25I6kUTyjUb4hB30vSNb_LpbZlZtaHNdDwkkc6TWaNhYQFhc3hAZTkyMmYxMmM2MzBhYzk4Y2ZlNDA0NDFjNWQwN2U2MzgxZjI5MmI3NzEyZTI1MzBlZGU0ODQ4YjRjYWVmN2QyY2FjWCECWV5nOHyceHPIQcWRj-0BeCkBOztEfwKueKSgs5SuAsWjYWEBYXN4QDYyY2EyYzc4MzU0NjdjODI0YWQ4ZWY0N2ZhYjc0MDJjNDEyOWQ3OGU2YWI2NTEyMTE0NTliODY5ZThiMTQ3NDZhY1ghAqGlj2XRVVfR4aELrJVMEErczuzWQPBtSRq5orqBdkkO');
            const result = await mergeChange(token);
            expect(result).to.deep.equal(token.proofs);
        });

        it("should merge valid change proofs with input proofs", async () => {

            const token = getDecodedToken('cashuBo2FteBxodHRwczovL3N0YWJsZW51dC51bWludC5jYXNoYXVjdXNkYXSBomFpSAD2hOihuoaWYXCSo2FhEGFzeEA3ZTAzZTkwYTQ4YjQzY2FjZWNiZTMwNDUzNDRjOTdlYjZiYTJlNDgzNzEyOTlhOTEyZjk0MGE4ZWIxYjgzZjQ4YWNYIQPt3_YI1Wwjo4uUxPdJJqgLfp14EvkVTf-KmA0mMoqWhqNhYRBhc3hAMjg0NTdmMzRlOWVkZTZmODgzMWFhOTY5YTk3NDkwM2ZhZDdiZDFlNTJlZjBiZDk4MWE5NmJhNGVkMmUzZGM3NmFjWCEDm1SUEM5kOe8pR0rDUx31fdVnw4N2Fas2aSwoiIRtAgqjYWEQYXN4QDg3YTZhZTRkOGEzNDk5MjIwNDhhODMyZTBjYmZlZWJjMDU4MTFkOTQzYTNiYzMxOGY0NDg0MGQ1OTE4NTZlNzRhY1ghAynlZr9kXkvJH3BUVkwgnTPBZCyEMpdc83fRP5b5QQN4o2FhCGFzeEAxYTE0Zjc4ZTYyMDI4MDE0NzQ5NTJlY2MyMGI2MjdlYjVlZGRmNWE0OGRhMTJlZTk5ZmY5ODMwNjJhZmM2ZWQyYWNYIQMyZ-YPWreFGAeXJOY2S4Qv4afWs_Ny2LzSueUwSi1SMaNhYQhhc3hAM2NiMjg4MzAyZDk5ZmE0ZGFkOTA0NzFkODVhYTJlNDNiNTFjODY5ZWVkNGFkY2E3NzJmNjkxZTE4YmUzMjY2OWFjWCEDFZcCxbznMqBijvcl6TlYBqSjEcaN7c0YZhOogX-_-YSjYWEIYXN4QGIwYTc0MDM2YmRmYWRlYjg3ZDEzZWY3OTg1ZjFmY2YyODEyMmRlNjczMTY0MTZjNjQ4YzRmYjc4ODVhMTVlNjJhY1ghAzduCOLxtV7JNXdfo47j7uQqh4SNOStdOLfQZw6taLhno2FhBGFzeEA3MzA1MjdjNzJkYmI0MzU3NmI1NDBjMTRlMzBhZjI1ZGY5ZDg0ZTdmZGI3NzZmNWM4YzEzNThiNmI4ODAxZTY5YWNYIQL0kUtWuDAH7P4VhcA8vmMYAk5jSH-LaJD8_kdr_o0OVaNhYQRhc3hAMzhhMDE4YWY3MWYwYjI5ZWMwZmU0ZDM1NWZmYjM0ZmEzNTFhYjVmMTc0YTczYjJiZjhjMGYxNzJhM2FmZDE0ZGFjWCEDRnsfuCTqZno2RWAvi1y9djRnpMLoVWHKRawqx2010myjYWEEYXN4QDdiNmFhNTVmODQzNDQzODE2MGZjOTE2MzFjMzU5NjMxMWE4ZTc1Mzk4NmRjNzBjNjA3YzI0ZmI5OGEwMjIzODdhY1ghA3U0Zz3nVGoRLKCsak3NLxerf3WU73nzsaFv4b3BmsBMo2FhBGFzeEA0ZmRiZGYzODZmZTYyMTQ4ZTNlOGIzODMwMDk2MDQ1OWNmMTRlZmVhMmRmOTg4ZmZjMzBiN2I3MmFlNjY2OGE3YWNYIQOrqzP-n1y8scAYk_2pQxm4DScqUtiDqp_WBJPlU2aRR6NhYQJhc3hANjMwNTQ3ZjY2ZDFhZGY4OGNkYjMxMGUwNDBkNzgxNGZkNWJiM2ZmOGVjODc2ODc2MDlmMjEyNThhYjcxYjlmMWFjWCEDKTEVq-Q5A_IDcW8tvByodmC3jFKSBChbs9YEpjrkDAyjYWECYXN4QGU1MWMzN2NlYzVhYjEyNTBlYWQwODFhY2ZlNmQxODM2MWMxN2Q1ZGYwZDVlZmFjNWYxMTYxZWMzNDIzNDhjMmVhY1ghAzVHF_03-rRbRKKhbrKHhncKx02Dhod5hNuA-z8I0oEVo2FhAmFzeEBhNzYzNmEzN2Q1ZGEyMDEzNGU0ZjA2ZjRkZjAxMWE2MGJlMTJiOGFiZGRkODkyMzA1ZmQ4NzY3OWJkMDAxNWE4YWNYIQKi21QrVokb1Y-VrjBQ8bMJ3EV0yd2vpldWPkQZo-pinqNhYQJhc3hAMTFmOWU1YmRkMWQ2ZDQ4OTBmNzVjYzAyZjg3YzcyNmViMTZmNWU5YTFiNWNiODA1NWI1YmM0Mjg1NjQxOTY3MGFjWCECHKmiSZZgPdKpjoGfiZtXcThTQSyVMmjE1X-FcwnnutujYWEBYXN4QDFkODczYmIzZmM1ZjIzOWEyMzNjZmY3YWM3ZmFlNzYyYzIwOTM2ZjIxOTc0NTc4MmU3ZjYyZGQ5MjQyYTFkNDdhY1ghAsDR9J1XOMJ6NYYS2B1OnR7iOKUQyBntMFwtHG-d4eIdo2FhAWFzeEA4NjExNzdmYTAxY2Y1ZTg1Mzk0ZDQ1NDUxMWM4NDUyM2ZhNDYyOWQzYTY4MTEzNmFjZjZjNmM2MzQ5ZjI3OTdkYWNYIQK9o25I6kUTyjUb4hB30vSNb_LpbZlZtaHNdDwkkc6TWaNhYQFhc3hAZTkyMmYxMmM2MzBhYzk4Y2ZlNDA0NDFjNWQwN2U2MzgxZjI5MmI3NzEyZTI1MzBlZGU0ODQ4YjRjYWVmN2QyY2FjWCECWV5nOHyceHPIQcWRj-0BeCkBOztEfwKueKSgs5SuAsWjYWEBYXN4QDYyY2EyYzc4MzU0NjdjODI0YWQ4ZWY0N2ZhYjc0MDJjNDEyOWQ3OGU2YWI2NTEyMTE0NTliODY5ZThiMTQ3NDZhY1ghAqGlj2XRVVfR4aELrJVMEErczuzWQPBtSRq5orqBdkkO');
            localStorage.setItem("mints", JSON.stringify(["https://stablenut.umint.cash"]));
            //example proofs
            localStorage.setItem("proofs", JSON.stringify([
                {
                    amount: 8,
                    //valid keyset for https://stablenut.umint.cash (usd unit)
                    id: '00f684e8a1ba8696',
                    secret: 'knjhgvcfgvhbjnk',
                    C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
                },  {
                    amount: 8,
                    //valid keyset for https://stablenut.umint.cash (usd unit)
                    id: '00f684e8a1ba8696',
                    secret: 'mknjhgcfygvuhbijnok',
                    C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
                }
            ]));

            const result = await mergeChange( token);
            expect(result).to.deep.equal([
                ...token.proofs,
                {
                    amount: 8,
                    id: '00f684e8a1ba8696',
                    secret: 'knjhgvcfgvhbjnk',
                    C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
                },  {
                    amount: 8,
                    id: '00f684e8a1ba8696',
                    secret: 'mknjhgcfygvuhbijnok',
                    C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
                }
            ]);
        });

    });



})

describe("lightningUtils", () => {
    describe("createInvoice", () => {
        it("Should throw error if source is missing", async () => {
            await expect(createInvoice(10, undefined!)).to.be.rejectedWith(Error)
        });

        it("Should throw error if amount is invalid", async () => {
            await expect(createInvoice(-10, new LightningAddress("d4rp4t@lifpay.me"))).to.be.rejectedWith(Error)
        })
        it("Should create valid invoice if amount is valid and source is Lightning Address", async () => {
            const address = new LightningAddress("d4rp4t@lifpay.me")
            const invoice = await createInvoice(10, address)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(invoice).not.to.be.undefined;
            const {satoshi}= new Invoice({pr:invoice!})
            expect(satoshi).to.deep.equal(10)
        }).timeout(10000)
        it("Should throw error if address is invalid", async () => {
            await expect(createInvoice(10, new LightningAddress("d4rp4t@lifpay.mesdasdasdad"))).to.be.rejectedWith(Error)
        })
        it("should throw error if LNURL is invalid", async () => {
            await expect(fetchLNURLData("LNURL1fcgvhbjnkml,;")).to.be.rejectedWith(Error)
            await expect(fetchLNURLData("definetlynotlnurl")).to.be.rejectedWith(Error)
        }).timeout(10000)
        it("Should throw error if LNURL is valid but amount is invalid", async () => {
            it("Should throw error if amount is invalid", async () => {
                const lnurl = "LNURL1DP68GURN8GHJ7MRFVECXZ7FWD4JJ7TNHV4KXCTTTDEHHWM30D3H82UNVWQHKGDRJWQ68G0MNDC75GDESXGMNX3PH94ZYVDJ9956NVS6P94PRWVEE956RWS6YXEP5ZD3J8QENWFNRVDUN642NGSS95XQ4"
                await expect(createInvoice(-10, await fetchLNURLData(lnurl))).to.be.rejectedWith(Error)
            })
        }).timeout(10000)
        it("Should create invoice if amount and LNURL are valid", async () => {
            const lnurl = "LNURL1DP68GURN8GHJ7MRFVECXZ7FWD4JJ7TNHV4KXCTTTDEHHWM30D3H82UNVWQHKGDRJWQ68G0MNDC75GDESXGMNX3PH94ZYVDJ9956NVS6P94PRWVEE956RWS6YXEP5ZD3J8QENWFNRVDUN642NGSS95XQ4"
            const lnurlData = await fetchLNURLData(lnurl)
            const invoice = await createInvoice(1000, lnurlData)
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(invoice).not.to.be.undefined;
            const {satoshi}= new Invoice({pr:invoice!})
            expect(satoshi).to.deep.equal(1000)
        }).timeout(10000);
    });
});

