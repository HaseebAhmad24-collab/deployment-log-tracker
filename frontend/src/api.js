const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseErrorMessage(response, fallback) {
  try {
    const data = await response.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchLogs() {
  const response = await fetch(`${API_BASE_URL}/api/logs`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to fetch logs'));
  }
  return response.json();
}

export async function createLog(message, imageFile) {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/logs`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to add log'));
  }
  return response.json();
}

export async function deleteLog(id) {
  const response = await fetch(`${API_BASE_URL}/api/logs/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to delete log'));
  }
  return response.json();
}
