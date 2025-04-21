import { useAccount, useSendTransaction } from 'wagmi';
import styles from '../styles/Home.module.css';
import { privateKeyToAccount } from 'viem/accounts';
import { parseEther } from 'viem';

const FAUCET_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const FaucetButton = () => {
    const { sendTransaction} = useSendTransaction()
  const {address} = useAccount()

  const giveFromFaucet = async () => {
     const faucetAccount = privateKeyToAccount(FAUCET_PRIVATE_KEY)
    
    sendTransaction({
      account: faucetAccount,
      to: address!,
      value: parseEther('1')
    })
  }

  return (
    <button className={styles.button} onClick={giveFromFaucet}>
      Get 1 ETH from faucet
    </button>
  );
};

export default FaucetButton;