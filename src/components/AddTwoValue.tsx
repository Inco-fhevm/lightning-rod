import { useReadContract } from "wagmi";
import { addTwoAbi } from "../abis/AddTwo";

const addTwoAddress = "0x723c2be5E61e7bBec4684DEfEaE63656ad3eaa10";

const AddTwoValue = () => {
    const  lastResult = useReadContract({
        abi: addTwoAbi,
        address: addTwoAddress,
        functionName: "lastResult"})

    return <>{lastResult.data}</>
}

export default AddTwoValue 