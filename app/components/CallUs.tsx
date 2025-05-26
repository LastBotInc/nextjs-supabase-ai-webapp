"use client";

import React from "react";
import Link from "next/link";
import { IconPhone } from "./Icons";

type CallUsProps = {
  numbers: { title: string; number: string }[];
};

export function CallUs({ numbers }: CallUsProps) {
  return (
    <div className="flex flex-row bg-white rounded-full p-4 lg:self-end call-us text-sm self-start lg:pr-12">
      {numbers.map((number) => (
        <Link key={number.number} href={`tel:${number.number}`} className={`flex items-center gap-2 text-gray-700`}>
          <div className="bg-kupari rounded-full p-2">
            <IconPhone className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span>{number.title}</span>
            <span>{number.number}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
