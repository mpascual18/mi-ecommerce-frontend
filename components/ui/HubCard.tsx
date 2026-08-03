import Link from 'next/link';

type Props = {
  href: string;
  icon: string;
  title: string;
  description: string;
};

export default function HubCard({ href, icon, title, description }: Props) {
  return (
    <Link
      href={href}
      className="block bg-white shadow-sm border border-gray-100 p-6 rounded-xl hover:shadow-md hover:border-primary/30 transition"
    >
      <h2 className="text-xl font-semibold mb-2">
        {icon} {title}
      </h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
