import axios from 'axios';

export interface ClickUpTask {
  id: string;
  name: string;
  status: string;
  url: string;
}

const BASE_URL = 'https://api.clickup.com/api/v2';

export async function getTasksFromList(listId: string, apiKey: string): Promise<ClickUpTask[]> {
  const response = await axios.get(`${BASE_URL}/list/${listId}/task`, {
    headers: { Authorization: apiKey },
    params: { include_closed: false, page: 0 },
  });
  return (response.data.tasks as any[]).map(t => ({
    id: t.id,
    name: t.name,
    status: t.status?.status ?? 'unknown',
    url: t.url,
  }));
}

export async function updateTaskWithReleaseTag(taskId: string, releaseTag: string, apiKey: string): Promise<void> {
  await axios.post(
    `${BASE_URL}/task/${taskId}/comment`,
    { comment_text: `🚀 Released in ${releaseTag}`, notify_all: false },
    { headers: { Authorization: apiKey } }
  );
}
