export default function EmptyState({ title = 'Nothing here yet', description }: { title?: string; description?: string }) {
  return (
    <div className="rounded border p-6 text-center">
      <h3 className="font-medium">{title}</h3>
      {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
    </div>
  );
}


