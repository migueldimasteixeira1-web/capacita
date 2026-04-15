import { Outlet } from "react-router-dom";
import { ParticipantHeader } from "@/components/participant/ParticipantHeader";

export default function ParticipantLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ParticipantHeader />
      <Outlet />
    </div>
  );
}
