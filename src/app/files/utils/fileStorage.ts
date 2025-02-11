// Save a file to Local Storage
export async function saveFile(
  fileName: string,
  content: string
): Promise<void> {
  localStorage.setItem(fileName, content);
}

// Load a file from Local Storage
export async function loadFile(fileName: string): Promise<string | null> {
  const content = localStorage.getItem(fileName);
  return content ? content : null; // Return null if file does not exist
}

// Delete a file from Local Storage
export async function deleteFile(fileName: string): Promise<void> {
  localStorage.removeItem(fileName);
}
