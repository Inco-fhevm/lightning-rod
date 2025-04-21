import { useWriteContract } from "wagmi";
import { addTwoAbi, addTwoAddress } from "../abis/AddTwo";

const SendANumberToAddTwo = () => {
    const { writeContract} = useWriteContract()
    
    return <>
        <button
            onClick={() => {
                writeContract({
                    abi: addTwoAbi,
                    address: addTwoAddress,
                    functionName: "addTwoEOA",
                    args: ["0x"]
                })
            }}
        >input nb 5</button>
    </>
}

export default SendANumberToAddTwo;