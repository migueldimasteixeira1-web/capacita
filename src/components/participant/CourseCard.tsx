import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course } from "@/domain/types";
import { courseLifecycleLabel, occupiedSlots } from "@/domain/rules";
import { ROUTES } from "@/constants/routes";
import { useCapacitaSelector } from "@/services/capacitaStore";

const categoryColors: Record<string, string> = {
  Tecnologia: "bg-info/10 text-info",
  Cidadania: "bg-primary/10 text-primary",
  Gestão: "bg-warning/10 text-warning",
  Saúde: "bg-success/10 text-success",
  Finanças: "bg-accent text-accent-foreground",
  "Meio Ambiente": "bg-success/10 text-success",
};

export function CourseCard({ course }: { course: Course }) {
  const state = useCapacitaSelector((s) => s);
  const occ = occupiedSlots(state, course.id);
  const spotsLeft = Math.max(0, course.spots - occ);
  const isFull = spotsLeft <= 0;

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-0">
        <div className="h-2 bg-primary" />
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                categoryColors[course.category] || "bg-muted text-muted-foreground"
              }`}
            >
              {course.category}
            </span>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {courseLifecycleLabel(course.status)}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-foreground leading-snug line-clamp-2">{course.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{course.description}</p>
          </div>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {new Date(course.displayDate).toLocaleDateString("pt-BR")} • {course.displayTimeRange}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{course.workloadHours}h • {course.modality}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{course.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>
                {isFull ? "Vagas esgotadas" : `${spotsLeft} vagas disponíveis`}
              </span>
            </div>
          </div>

          <Link to={ROUTES.portal.course(course.id)}>
            <Button className="w-full" size="sm">
              {isFull && course.status === "inscricoes_abertas"
                ? "Ver detalhes (possível lista de espera)"
                : "Ver detalhes e regras"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
