import { WalletBoard } from "@/components/manage-artist/wallet/WalletBoard"

export default function MUAWalletPage({ params }: { readonly params: { id: string } }) {
    return (
           <WalletBoard muaId={params.id}/>
    );
}