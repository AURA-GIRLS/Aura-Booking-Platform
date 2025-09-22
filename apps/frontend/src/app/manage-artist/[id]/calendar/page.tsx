import { ArtistCalendar } from "@/components/manage-artist/schedule/ArtistCalendar";

export default function SchedulePage({ params }: { readonly params: { id: string } }) {
    return (
            <ArtistCalendar id={params.id} />
    );
}