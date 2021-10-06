/** @format */
import fetch from "node-fetch";
import marked = require( "marked");

// Gets MD content from a tasks table
function get_task_content(tasks_to_extract: any): Promise<any[]> {
  const tasks_with_promises = tasks_to_extract
    .filter(
      (task) =>
        task["task summary url"].includes(".md") &&
        task["task summary url"].includes("https://") &&
        task.phase == "2"
    )
    .map(async (task) => {
      task.url = task["task summary url"]
        .replace("https://github.com/", "https://raw.githubusercontent.com/")
        .replace("/blob/", "/")
        .replace(" ", "");
      task.content = await fetch(task.url)
        .then((res) => res.text())
        .then((md) => marked(md));
      return task;
    });
  return Promise.all(tasks_with_promises);
}

// Filters out broken tasks
export const get_renderable_tasks = async (tasks_to_extract) => {
  return (await get_task_content(tasks_to_extract)).filter(
    (task) => !task.content.includes("404: Not Found")
  );
};
