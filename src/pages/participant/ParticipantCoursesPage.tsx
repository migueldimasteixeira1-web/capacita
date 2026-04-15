import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/components/participant/CourseCard";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { courseIsVisibleToParticipant } from "@/domain/rules";
import { InlineEmpty } from "@/components/system/PageStates";

export default function ParticipantCoursesPage() {
  const courses = useCapacitaSelector((s) => s.courses.filter(courseIsVisibleToParticipant));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  const categories = ["Todos", ...Array.from(new Set(courses.map((c) => c.category)))];

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Todos" || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <main className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Catálogo institucional</h1>
        <p className="page-subtitle">
          Cursos e ofertas autorizadas pela gestão municipal. Inscrição sujeita a validação e vagas.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <InlineEmpty
          title="Nenhum curso disponível no momento"
          description="Não há ofertas publicadas para o seu perfil ou o filtro aplicado não retornou resultados."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}
