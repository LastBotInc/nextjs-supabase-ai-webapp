import Image from "next/image";
import { Flex } from "../core/Flex";
import { Columns } from "../core/Columns";

/**
 * PersonnelCard component for displaying a grid of personnel/contact cards.
 * Each card shows a photo, name, title, phone, and email, matching the provided image layout.
 * @param people - Array of personnel objects
 * @param columns - Number of columns in the grid (default: 2)
 * @param className - Optional extra classes for the grid
 */
export function PersonnelCard({
  people,
}: {
  people: Array<{
    name: string;
    title: string;
    phone: string;
    email: string;
    image: { src: string; alt: string };
  }>;
  className?: string;
}) {
  return (
    <Columns columns={{ default: 2 }}>
      {people.map(
        (person: {
          name: string;
          title: string;
          phone: string;
          email: string;
          image: { src: string; alt: string };
        }) => (
          <Flex key={person.email} autoFlexChildren={false}>
            <div className="mb-2 md:mb-0 w-24 relative" style={{ aspectRatio: "120/170" }}>
              <Image src={person.image.src} alt={person.image.alt} layout="fill" className="grayscale object-cover" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-lg text-black mb-1">{person.name}</div>
              <div className="text-black mb-3">{person.title}</div>
              <div className="text-black mb-1">
                <a href={`phone:${person.phone}`} className="hover:text-kupari transition-colors">
                  {person.phone}
                </a>
              </div>
              <div className="text-black">
                <a href={`mailto:${person.email}`} className="hover:text-kupari transition-colors">
                  {person.email}
                </a>
              </div>
            </div>
          </Flex>
        )
      )}
    </Columns>
  );
}
