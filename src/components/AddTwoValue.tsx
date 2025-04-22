import { useReadContract } from "wagmi";
import { addTwoAbi, addTwoAddress } from "../abis/AddTwo";

const AddTwoValue = () => {
    const  lastResult = useReadContract({
        abi: addTwoAbi,
        address: addTwoAddress,
        functionName: "lastResult"})

    return <>{lastResult.data}</>
}

export default AddTwoValue;