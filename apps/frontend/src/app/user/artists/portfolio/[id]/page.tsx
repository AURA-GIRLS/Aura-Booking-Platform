import PortfolioBoard from "@/components/mua-portfolio/PortfolioBoard";

export default function PortfolioPage({ params }: { readonly params: { id: string } }) {
    return (
           <PortfolioBoard/>
    );
}