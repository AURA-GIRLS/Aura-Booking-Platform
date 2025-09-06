export default function NotificationBell() {
  return (
    <button aria-label="Notifications" className="relative rounded p-2 hover:bg-gray-100">
      <span className="absolute right-1 top-1 inline-block h-2 w-2 rounded-full bg-red-500" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M12 2a7 7 0 00-7 7v3.586l-.707.707A1 1 0 005 15h14a1 1 0 00.707-1.707L19 12.586V9a7 7 0 00-7-7zM8 17a4 4 0 008 0H8z" />
      </svg>
    </button>
  );
}


