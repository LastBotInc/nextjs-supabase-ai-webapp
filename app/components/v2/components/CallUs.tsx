"use client";

import React, { HTMLAttributes } from "react";
import Link from "next/link";
import { IconEmail, IconPhone } from "../../Icons";
import { cn } from "@/lib/utils";

type CallUsProps = HTMLAttributes<HTMLDivElement> & {
  numbers: { title: string; number: string }[];
};

/**
 * CallUs component is used to display a list of phone numbers and email addresses.
 *
 * @param numbers - An array of objects with title and number properties.
 * @param className - Optional className to apply to the component.
 * @param rest - Additional props to pass to the component.
 * @returns A div element with a list of phone numbers and email addresses.
 */
export function CallUs({ numbers, className, ...rest }: CallUsProps) {
  const title = numbers[0].title;
  const number = numbers[0].number;
  const email = "info@innolease.fi";
  return (
    <div className={cn("call-us", className)} {...rest}>
      <Link href={`tel:${number}`} className={`flex items-center gap-2 text-gray-700`}>
        <div className="bg-kupari rounded-full p-2">
          <IconPhone className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span>{title}</span>
          <span>{number}</span>
        </div>
      </Link>
      <div className="divider"></div>
      <Link href={`mailto:${email}`} className={`flex items-center gap-2 text-gray-700`}>
        <div className="bg-kupari rounded-full p-2">
          <IconEmail className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span>{email}</span>
        </div>
      </Link>
    </div>
  );
}
