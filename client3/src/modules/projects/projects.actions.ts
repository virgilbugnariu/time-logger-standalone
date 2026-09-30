import { records as db } from "../../db";
import projectsSlice, { type Project } from "./projects.slice";

export async function loadProjects() {
  try {
    const projects = await db.list('projects') as unknown as Project[] | null;

    if (!projects) {
      return;
    }

    (projects || []).forEach(projectsSlice.actions.set);

  } catch (error) {
    // TODO(bogdan): handle this
    console.log(error);
    console.error("ERROR loading projects");
  }
}
