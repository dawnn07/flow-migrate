"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  oldToken: string;
  newToken: string;
  migrated: number;
  total: number;
  startDate: string;
  endDate: string;
  status: "active" | "claim" | "completed" | "pending";
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Token Migration Alpha",
    oldToken: "OLD",
    newToken: "NEW",
    migrated: 7500000,
    total: 10000000,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    status: "active",
  },
  {
    id: "2",
    name: "Beta Token Upgrade",
    oldToken: "BETA",
    newToken: "BETA2",
    migrated: 5000000,
    total: 5000000,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    status: "claim",
  },
];

interface ProjectTableProps {
  status: "active" | "claim" | "completed" | "pending";
}

export function ProjectTable({ status }: ProjectTableProps) {
  const filteredProjects = mockProjects.filter((p) => p.status === status);

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No {status} projects found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredProjects.map((project) => {
        const progress = (project.migrated / project.total) * 100;

        return (
          <div
            key={project.id}
            className="glassmorphism rounded-xl p-6 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold">
                    {project.oldToken[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.oldToken} → {project.newToken}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tokens Migrated</span>
                    <span className="font-mono text-cyan-400">
                      {project.migrated.toLocaleString()} / {project.total.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="block text-xs">Start Date</span>
                    <span className="font-mono">{project.startDate}</span>
                  </div>
                  <div>
                    <span className="block text-xs">End Date</span>
                    <span className="font-mono">{project.endDate}</span>
                  </div>
                </div>
              </div>

              <Link href={`/migrate/${project.id}`}>
                <Button className="glow-cyan bg-cyan-600 hover:bg-cyan-700 group-hover:glow-cyan-strong transition-all">
                  {status === "claim" ? "Claim" : "Migrate"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
