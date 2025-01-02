import { MessageFile } from '../interfaces/message.interface';

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };

    reader.onerror = () => reject(`Failed to read file: ${file.name}`);
    reader.readAsDataURL(file);
  });
};

export const convertFilesToBase64 = async (
  files: File[],
): Promise<MessageFile[]> => {
  try {
    const filePromises = files.map(async (file) => {
      const base64Data = await readFileAsBase64(file);
      return <MessageFile>{ name: file.name, data: base64Data };
    });

    return await Promise.all(filePromises);
  } catch (error) {
    console.error('Error converting files to Base64:', error);
    return [];
  }
};
