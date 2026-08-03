type Props = { message: string; icon?: string };

export default function EmptyState({ message, icon = '📭' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-400 py-10">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
