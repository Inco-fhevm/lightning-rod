import { useAccount, useWriteContract } from "wagmi";
import { addTwoAbi, addTwoAddress } from "../abis/AddTwo";
import { encryptValue } from "../imports/incoLightning";
import { getActiveIncoLiteDeployment } from "@inco/js";
import { anvil } from "viem/chains";

const toInput:bigint = BigInt(5); 


const SendANumberToAddTwo = () => {
    const { writeContract} = useWriteContract()
    const { address : userAddress } = useAccount();

    async function encryptAndWrite() {
        const encrypted = await encryptValue({
        value: toInput,
        config: getActiveIncoLiteDeployment(anvil.id),
        address: userAddress as string,
        contractAddress: addTwoAddress,
        });

        console.log("encrypted", encrypted);

        writeContract({
                abi: addTwoAbi,
                address: addTwoAddress,
                functionName: "addTwoEOA",
                args: ["0x"]
            })
    }
    
    return <>
        <button
            onClick={() => {
                encryptAndWrite();
            }}
        >input nb 5</button>
    </>
}

export default SendANumberToAddTwo;