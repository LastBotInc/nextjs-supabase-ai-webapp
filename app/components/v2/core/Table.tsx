import { cn } from "@/utils/cn";
import { CheckIcon } from "@heroicons/react/24/outline";
import { HTMLAttributes } from "react";
import { Flex } from "./Flex";

type TableProps = HTMLAttributes<HTMLTableElement> & {
  headings: string[];
  rows: Array<string[]>;
  explanations?: string[];
};

// Helper to render check/cross or text
const renderCell = (value: boolean | string) => {
  if (value === "+")
    return (
      <span aria-label="Kyllä" title="Kyllä" className="text-green-600 flex items-center justify-center">
        <CheckIcon className="w-6 h-6" strokeWidth={4} />
      </span>
    );
  if (value === "-")
    return (
      <span aria-label="Ei" title="Ei" className=" text-2xl">
        -
      </span>
    );
  return <span>{value}</span>;
};

export function Table(props: TableProps) {
  return (
    <Flex direction="column" gaps="small">
      <div className="overflow-x-auto custom-table">
        <table className="min-w-full border-collapse rounded-xl">
          <thead>
            <tr>
              {props.headings.map((heading, index) => (
                <th className={index === 0 ? "sticky left-0 z-10" : ""} key={index}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row, idx) => (
              <tr key={idx} className={cn("text-piki", idx % 2 === 0 ? "bg-gray-50" : "bg-white")}>
                {row.map((cell, index) => {
                  if (index === 0) {
                    return (
                      <th className={index === 0 ? "sticky left-0 z-10" : ""} key={index}>
                        {cell}
                      </th>
                    );
                  }
                  return (
                    <td className="text-center px-4 py-2" key={index}>
                      {renderCell(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {props.explanations && (
        <div className="flex flex-col gap-4 p-6">
          {props.explanations.map((explanation, index) => (
            <span className="text-sm palette-text-color" key={index}>
              {"*".repeat(index + 1)} {explanation}
            </span>
          ))}
        </div>
      )}
    </Flex>
  );
}
