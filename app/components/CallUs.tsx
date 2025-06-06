"use client";

import React from "react";
import Link from "next/link";
import { IconEmail, IconPhone } from "./Icons";

type CallUsProps = {
  numbers: { title: string; number: string }[];
};

export function CallUs({ numbers }: CallUsProps) {
  const title = numbers[0].title;
  const number = numbers[0].number;
  const email = "info@innolease.fi";
  return (
    <div className="flex flex-row bg-white rounded-full p-4 lg:self-end call-us text-sm self-start lg:pr-8">
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
