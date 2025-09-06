export default function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}


