import ConnectNostrBtn from './ConnectNostrBtn';
import User from './User';
import CoinFlip from './CoinFlip';
import GamesListener from './GamesListener';

export default function Home() {
    return (
        <div className="flex flex-col w-screen items-center bg-gradient-to-br from-slate-900 to-slate-800">
            <ConnectNostrBtn />
            <User />

            <div className="flex flex-col items-center justify-center w-screen">
                <CoinFlip />
                <GamesListener />
            </div>
        </div>
    );
}
