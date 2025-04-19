// This is a mock implementation of file upload functionality
// It doesn't actually use Firebase Storage

/**
 * Mock file upload that returns a fake URL
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  console.log(`Mock uploading file ${file.name} to ${path}`);
  return `https://example.com/mock-files/${path}/${file.name}`;
}

/**
 * Mock file upload progress tracker
 */
export async function uploadFileWithProgress(
  file: File, 
  path: string,
  onProgress: (progress: number) => void
): Promise<string> {
  // Simulate upload progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    onProgress(progress);
    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 300);
  
  // Wait 3 seconds to simulate upload time
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return `https://example.com/mock-files/${path}/${file.name}`;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a unique file path for storage
 * @param file The file to upload
 * @param userId Optional user ID to include in the path
 * @param folder The folder in storage
 * @returns The unique file path
 */
export function generateFilePath(file: File, userId?: string, folder = 'uploads'): string {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const fileName = `${file.name.split('.')[0]}-${timestamp}.${extension}`;
  
  if (userId) {
    return `${folder}/${userId}/${fileName}`;
  }
  
  return `${folder}/${fileName}`;
} 