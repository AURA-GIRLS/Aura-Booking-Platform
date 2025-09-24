import PortfolioBoard from "@/components/mua-portfolio/PortfolioBoard";

export default function PublicPortfolioPage({ params }: { readonly params: { id: string } }) {
    return (
           <PortfolioBoard/>
    );
}