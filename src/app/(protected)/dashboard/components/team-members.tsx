"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();

  const { data: members } = api.project.getTeamMember.useQuery({
    projectId,
  });

  return (
    <div className="flex -space-x-2">
      {members?.map((member) => (
        <Image
          key={member.id}
          src={member.user.imageUrl ?? "/avatar.png"}
          alt={`${member.user.firstName ?? "User"}`}
          width={32}
          height={32}
          className="rounded-full border-2 border-white"
        />
      ))}
    </div>
  );
};

export default TeamMembers;
