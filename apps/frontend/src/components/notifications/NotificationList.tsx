type Notification = { id: string; message: string; read?: boolean };

export default function NotificationList({ items = [] }: { items?: Notification[] }) {
  if (!items.length) {
    return <p className="text-sm text-gray-500">No notifications</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li key={n.id} className="rounded border p-3 text-sm">
          {n.message}
        </li>
      ))}
    </ul>
  );
}


