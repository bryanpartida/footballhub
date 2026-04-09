import { Navigate } from "react-router-dom";
import { useSelectedTeam } from "../hooks/useSelectedTeam";

export default function TeamEntry() {
    const { selectedTeam } = useSelectedTeam();

    if (!selectedTeam) {
        return <Navigate to="/select-team" replace />;
    }

    return <Navigate to={`/club/${selectedTeam.id}`} replace />;
}
